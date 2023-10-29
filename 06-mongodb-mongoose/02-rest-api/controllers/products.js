const Product = require('../models/Product');
const mapProduct = require('../mappers/product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const productsBySubcategory = await Product.find({subcategory: subcategory});
  ctx.body = {productsBySubcategory: productsBySubcategory.map(mapProduct)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find();
  ctx.body = {products: products.map(mapProduct)};
};

module.exports.productById = async function productById(ctx, next) {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.throw(400, 'invalid product id');
  }
  const product = await Product.findById(id);

  if (!product) {
    ctx.throw(404, `no product with ${id} id`);
  }

  ctx.body = {product: mapProduct(product)};
};

