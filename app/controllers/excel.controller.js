
const XlsxData = require('../models/excel.model');
const XLSX = require('xlsx');

exports.insertXlsx = async (req, res) => {
  try {
    // Check if the file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Process the file buffer as an XLSX file
    const chunk = req.file.buffer;
    const workbook = XLSX.read(chunk, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Create an array of unique contacts
    const uniqueContacts = [];
    const emails = new Set();

    jsonData.forEach((item) => {
      console.log(item,"item")
      const email = item?.Email;
      if (!emails.has(email)) {
        emails.add(email);
        uniqueContacts.push({
          name: item?.Name,
          email,
          mobile: item?.Mobile,
          address: item?.Address,
          landmark: item?.Landmark,
          city: item?.City,
          industry: item?.Industry,
        });
      }
    });

    // Insert unique contacts into MongoDB
    await XlsxData.insertMany(uniqueContacts, { ordered: false }); // Use ordered: false to continue on duplicate key error

    res.status(201).json({ message: 'Contacts saved successfully' });
  } catch (error) {
    // Handle the duplicate key error separately
    if (error.name === 'BulkWriteError' && error.code === 11000) {
      console.error('Duplicate key error:', error);
      res.status(409).json({ message: 'Duplicate records found', error: error.message });
    } else {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
};
exports.getData = async (req, res) => {
    try {
        const contacts = await XlsxData.find();
        res.status(200).json({ message: 'Contacts retrieved successfully', data: contacts });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }

}

exports.deleteData = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await XlsxData.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: 'data not found' });
    }

    res.status(200).json({ message: ' Deleted successfully', product });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};