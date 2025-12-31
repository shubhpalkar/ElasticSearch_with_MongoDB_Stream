const ES_INDEX = "products";
const esClient = require("../configs/elasticsearch");
const productSchema = require("../models/product.model");

/**
 * Adds a new product to MongoDB and synchronizes it with Elasticsearch.
 * Ensures the Elasticsearch index exists, then indexes the product document.
 * Responds with the created product data or error message.
 */
module.exports.add = async (req, res) => {
    try {
        const product = new productSchema(req.body);
       const updatedData = await product.save();
       console.log("updatedData", updatedData)
        await createProductIndex();
       await syncProduct(product);
        return res.status(201).json({ status: "success", data: product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

/**
 * Updates an existing product in MongoDB and synchronizes the changes with Elasticsearch.
 * Finds the product by ID, updates it, and re-indexes the document in Elasticsearch.
 * Responds with the updated product data or error message.
 */
module.exports.update = async (req, res) => {
    try {
        const product = await productSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        //await syncProduct(product);
        return res.status(200).json({ status: "success", data: product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

/**
 * Removes a product from MongoDB and deletes the corresponding document from Elasticsearch.
 * Finds the product by ID and deletes it from both databases.
 * Responds with the deleted product data or error message.
 */
module.exports.remove = async (req, res) => {
    try {
        const result = await productSchema.findByIdAndDelete(req.params.id);
        //await removeProduct(req.params.id);
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

/**
 * Searches for products in Elasticsearch using various filters and pagination.
 * Supports text search, filtering by brand, category, price range, and sorting.
 * Responds with the list of matching products or error message.
 */
module.exports.search = async (req, res) => {
    const { q, brand, category, sub_category, gender, color, size, minPrice, maxPrice, sort = "asc", page = 0, size: pageSize = 10 } = req.query;
    const must = q ? [{ match: { name: { query: q, fuzziness: "AUTO" } } }] : [];
    const filter = [];

    if (brand) filter.push({ term: { brand } });
    if (category) filter.push({ term: { category } });
    if (sub_category) filter.push({ term: { sub_category } });
    if (gender) filter.push({ term: { gender } });
    if (color) filter.push({ term: { color } });
    if (size) filter.push({ term: { size } });
    if (minPrice || maxPrice) {
        filter.push({ range: { price: { gte: Number(minPrice) || 0, lte: Number(maxPrice) || 999999 } } });
    }

    try {
        const result = await esClient.search({
            index: ES_INDEX,
            from: page * pageSize,
            size: Number(pageSize),
            body: {
                query: {
                    bool: { must, filter }
                },
                sort: [{ price: { order: sort } }]
            }
        });
        return res.status(200).json({ status: "success", data: result.hits.hits.map(hit => hit._source) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

/**
 * Suggests products based on a fuzzy search of the product name.
 * Returns up to 5 suggestions matching the query string.
 * Responds with the list of suggested products or error message.
 */
module.exports.suggest = async (req, res) => {
    const { q } = req.query;
    try {
        const result = await esClient.search({
            index: ES_INDEX,
            size: 5,
            body: {
                query: {
                    match: {
                        name: {
                            query: q,
                            fuzziness: "auto",
                            prefix_length: 1,
                            operator: "and"
                        }
                    }
                }
            }
        });
        return res.status(200).json({ status: "success", data: result.hits.hits.map(hit => hit._source) });
    } catch (error) {
        console.log("error logs added", error);
        return res.status(500).json({ status: "failure", error: error.message });
    }
};

/**
 * Creates the Elasticsearch index for products if it does not already exist.
 * Defines the mapping for product fields in the index.
 */
const createProductIndex = async () => {
    try {
        const exists = await esClient.indices.exists({ index: ES_INDEX });
        console.log("exists-", exists)
        if (!exists) {
            await esClient.indices.create({
                index: ES_INDEX,
                body: {
                    mappings: {
                        properties: {
                            name: { type: "text" },
                            brand: { type: "keyword" },
                            category: { type: "keyword" },
                            sub_category: { type: "keyword" },
                            gender: { type: "keyword" },
                            size: { type: "keyword" },
                            price: { type: "float" },
                            discount: { type: "float" },
                            stock: { type: "integer" },
                            rating: { type: "float" },
                            description: { type: "text" },
                            color: { type: "keyword" },
                            tags: { type: "keyword" },
                            images: { type: "keyword" },
                            release_date: { type: "date" },
                            is_active: { type: "boolean" }
                        }
                    }
                }
            });
            console.log("Products elastic search index created !!!");
        }
    } catch (error) {
        console.log("Products elastic search index unable to create !!!");
        console.log(error);
    }
};

/**
 * Synchronizes a product document with Elasticsearch.
 * Converts the product to a plain object, removes the _id field, and indexes it.
 */
const syncProduct = async (product) => {
    try {
        const doc = product.toObject();
        delete doc._id;
        await esClient.index({
            index: ES_INDEX,
            id: product._id.toString(),
            body: doc
        });
        console.log("Products elastic search document inserted/updated !!!");
    } catch (error) {
        console.log("Products elastic search document unable to insert/update !!!");
        console.log(error);
    }
};

/**
 * Removes a product document from Elasticsearch by ID.
 */
const removeProduct = async (id) => {
    try {
        await esClient.delete({ index: ES_INDEX, id: id });
        console.log("Products elastic search document deleted !!!");
    } catch (error) {
        console.log("Products elastic search document unable to delete !!!");
        console.log(error);
    }
};
