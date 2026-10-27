/**
 * Activity & Recommendation Controller
 * Logs user behavior (searches, product views, additions to cart)
 * and generates personalized recommendations based on past user interactions.
 */
const Activity = require('../models/Activity');
const Product = require('../models/Product');

// @desc    Log a user interaction event
// @route   POST /api/activity
exports.logActivity = async (req, res, next) => {
  try {
    const { type, searchQuery, category, productId } = req.body;

    if (!type || !['search', 'view', 'add_to_cart'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid activity type is required (search, view, or add_to_cart).'
      });
    }

    const userId = req.user ? req.user.id : null;

    const activity = await Activity.create({
      user: userId,
      type,
      searchQuery: searchQuery || '',
      category: category || '',
      product: productId || null
    });

    res.status(201).json({
      success: true,
      activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart personalized recommendations based on past activity
// @route   GET /api/activity/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    let recommendedProducts = [];

    if (userId) {
      // Find the user's last 15 interactions
      const recentActivities = await Activity.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(15);

      if (recentActivities.length > 0) {
        // Collect viewed categories and search queries
        const categories = [
          ...new Set(
            recentActivities
              .map(a => a.category)
              .filter(cat => cat && cat.trim() !== '')
          )
        ];

        const searchedKeywords = [
          ...new Set(
            recentActivities
              .map(a => a.searchQuery)
              .filter(q => q && q.trim().length > 2)
          )
        ];

        const viewedProductIds = recentActivities
          .map(a => a.product)
          .filter(Boolean);

        // Build query for recommendations
        const matchCriteria = [];

        if (categories.length > 0) {
          matchCriteria.push({ category: { $in: categories } });
        }

        if (searchedKeywords.length > 0) {
          const keywordRegexes = searchedKeywords.map(k => new RegExp(k, 'i'));
          matchCriteria.push({ tags: { $in: keywordRegexes } });
        }

        if (matchCriteria.length > 0) {
          recommendedProducts = await Product.find({
            $or: matchCriteria,
            _id: { $nin: viewedProductIds } // Suggest novel products
          })
            .sort({ rating: -1 })
            .limit(8);
        }
      }
    }

    // Fallback: If not enough personalized items, fill with highest rated and trending items
    if (recommendedProducts.length < 4) {
      const existingIds = recommendedProducts.map(p => p._id);
      const fallbackItems = await Product.find({
        _id: { $nin: existingIds }
      })
        .sort({ rating: -1, createdAt: -1 })
        .limit(8 - recommendedProducts.length);

      recommendedProducts = [...recommendedProducts, ...fallbackItems];
    }

    res.status(200).json({
      success: true,
      count: recommendedProducts.length,
      recommendations: recommendedProducts
    });
  } catch (error) {
    next(error);
  }
};

