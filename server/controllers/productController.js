/**
 * Product Controller
 * Handles catalog browsing, multi-criteria filtering, search indexing, and product detail retrieval.
 */
const Product = require('../models/Product');

// @desc    Get all products with search, category filter, price range, sort, and pagination
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Sub-Category (e.g. for Books)
    if (subCategory && subCategory !== 'All') {
      query.subCategory = subCategory;
    }

    // Keyword Search across name, description, and tags
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { subCategory: searchRegex }
      ];
    }

    // Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Fetch related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of unique categories and product counts
// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categoriesWithCount = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { category: 1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured and trending products for Home page
// @route   GET /api/products/highlights
exports.getHighlights = async (req, res, next) => {
  try {
    const featured = await Product.find({ featured: true }).limit(8);
    const trending = await Product.find({ trending: true }).limit(8);

    // Fallbacks if flags not set
    const fallbackFeatured = featured.length > 0 ? featured : await Product.find().sort({ rating: -1 }).limit(8);
    const fallbackTrending = trending.length > 0 ? trending : await Product.find().sort({ createdAt: -1 }).limit(8);

    res.status(200).json({
      success: true,
      featured: fallbackFeatured,
      trending: fallbackTrending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick auto-suggestions for search bar dropdown
// @route   GET /api/products/suggestions
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const suggestions = await Product.find({
      $or: [{ name: regex }, { tags: regex }]
    })
      .select('name category price image')
      .limit(6);

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

