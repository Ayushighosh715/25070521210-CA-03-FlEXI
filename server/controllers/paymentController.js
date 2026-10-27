/**
 * Payment Controller
 * Generates dynamic dynamic UPI QR codes using standard NPCI upi:// URI format
 * and encodes them to base64 Data URLs via the `qrcode` package.
 */
const QRCode = require('qrcode');

// @desc    Generate a new unique UPI payment QR code for an order
// @route   POST /api/payment/upi-qr
exports.generateUpiQr = async (req, res, next) => {
  try {
    const { amount, referenceId } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid order amount is required to generate a UPI QR code.'
      });
    }

    // Generate a unique order reference code if not provided
    const refCode =
      referenceId ||
      `DEV${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedAmount = Number(amount).toFixed(2);
    const payeeVPA = 'devstore@upi';
    const payeeName = 'DevStore';

    // Standard NPCI UPI URI string
    const upiUri = `upi://pay?pa=${encodeURIComponent(
      payeeVPA
    )}&pn=${encodeURIComponent(
      payeeName
    )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(refCode)}`;

    // Generate base64 Data URL
    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 280,
      color: {
        dark: '#0B0F19', // Dark charcoal/navy color matching DevStore
        light: '#FFFFFF'
      }
    });

    res.status(200).json({
      success: true,
      message: 'UPI QR code generated successfully',
      qrCodeImage: qrDataUrl,
      upiString: upiUri,
      referenceId: refCode,
      payeeVPA,
      payeeName,
      amount: formattedAmount
    });
  } catch (error) {
    next(error);
  }
};

