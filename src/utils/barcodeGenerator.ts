// Function to calculate EAN-13 check digit
const calculateCheckDigit = (barcode: string) => {
    const digits = barcode.split('').map(Number);
    const oddSum = digits.filter((_, i) => i % 2 === 0).reduce((acc, curr) => acc + curr, 0);
    const evenSum = digits.filter((_, i) => i % 2 !== 0).reduce((acc, curr) => acc + curr * 3, 0);
    const totalSum = oddSum + evenSum;
    const checkDigit = (10 - (totalSum % 10)) % 10;
    return checkDigit;
};

//Function to ensure valid EAN-13 barcode
const ensureValidEAN13 = (barcode: string) => {
    if (barcode.length !== 13) {
        // Trim or pad the barcode to be 12 digits, and recalculate the check digit
        const code = barcode.slice(0, 12).padEnd(12, '0');
        const checkDigit = calculateCheckDigit(code);
        return code + checkDigit;
    }
    return barcode;
};

//Function to generate barcode images
const generateBarcodes = (products) => {
    products.forEach(product => {
        let { name, barcode } = product;

        // Ensure the barcode is valid EAN-13
        barcode = ensureValidEAN13(barcode);

        const filePath = path.join(outputDir, `${name.replace(/\s+/g, '_')}.png`);

        bwipjs.toBuffer({
            bcid:        'ean13',       // Barcode type
            text:        barcode,       // Text to encode
            scale:       3,             // 3x scaling factor
            height:      10,            // Bar height, in millimeters
            includetext: true,          // Show human-readable text
            textxalign:  'center',      // Center-align the text
        }, function (err, png) {
            if (err) {
                console.error(`Error generating barcode for ${name}:`, err);
            } else {
                fs.writeFileSync(filePath, png);
                console.log(`Barcode for ${name} saved as ${filePath}`);
            }
        });
    });
};