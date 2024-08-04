const iap = require("in-app-purchase");
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

const iapTestMode = true;
iap.config({
    // If you want to exclude old transaction, set this to true. Default is false:
    appleExcludeOldTransactions: true,
    // this comes from iTunes Connect (You need this to valiate subscriptions):
    applePassword: "8bf06072be48463b8805f4d60b2c960d",
  
    googleServiceAccount: {
      clientEmail: "NirmalaBagERP-iap@NirmalaBagERP-51650.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxIzOnKIDpH9Gp\nDaps6ITOnpd9HHcsZQ+FUYNPDv02quCdIL1Mb5qXrhaSbxvSWACNdJtS4m7IJxav\n0lhkFH4qI6wDnwOLC5vcdmDGJ1hAqSh0jOtmvUZ05XH5MEo+ThqjIz2qdXjzSbY1\nZGZPko12LU67PONAKN+hBYTkbon84lVKgJ3iJzncEp0uoVyZ+X5/HLjpdxC/TexI\nORcm9xQAhcYMDM91VVD2SK9+t+k9hWOl56nuwHH4Y1BnQ11nszkt36KmiOKNLxoF\nhZCwP9UUsXanASCkDKdGFcOUYWaF4DCnOnQI/eveI/SSPy1yASepKyqH0BUwWI08\nAZSdQSYlAgMBAAECggEAJRDSIqTBkMaFNyQyaLag76FU3quhrkr5W/LKELV4u8M2\n2/o5UjC6PwoBFCQmxLWAbBkd1VKnTr+LKkBQGaUGH2g2es1/zs0fkJq+tkgOWf1r\nhzPjoCxz/UrztepqZq4uObvKkAwjwnjGpVZ8aCMo8bUaV+iuPsMuxEFk5O3SdvVF\nMRKGv4iZc3x1/k5yHmWS5FaqwBatb0VsocsGa3ZekbJVl08ZeA3D3Qyz6OVV8SeA\ny30a5YGnU1v8f28yNpYtjJIOPrNgS6w5NFPK+qx8LbxUJasJ0tMUqsIKZ0e/w46m\nximsJgLFLIXzysxAdJ2aezztBG2YorU1zAFbXG408QKBgQD30zessDnnOKnyCWbd\nVQuXQYLDd17ywzMJDCcWGDV/VmXrbiegc/PhefpuDGKJBfUyqOatqr8M/qdQkQ6d\nftAON1hUEEL8nvcYEhyXGxqv7InnsamjZaZBG0xHSVEoEkFw6r+uHC4mKaDHE/nv\nctIGs+tIRxcFkt1bY+xmJpDQTQKBgQC2+w5w2mzEibR86OekTLXNJQ/ChlAN+AT5\nOJ+J95DBMfiqPvnAEctlJah8pkWayYlg6vkB0TUPfud4SE8YrcmP/1s+x6zJFCHx\n1I1mOFkz8AU/022oRoNOZZPEHuSKva+ZiUQBamtDAb9wy4t0xTqgUlQfyzKy4wff\n6qxFdPhZOQKBgA0o0hQBZ5G3mI6ZoTSvh2YIvIDUnd4WL2eTlZ++uViBpffSaZhD\nj/exGnMthS3xewutnFIsduihvRCyIyyJx1J57d7I3kW7yzMkAxCjB8+/p7L95Bwh\nEarzYCGI6x5Nmdv9GyCLroeoPjlT/jmQx0ZD14KHA9nv6oEn1S23bokhAoGBAKEs\nzRCM5WfNICUyhe/L/guATLx80IEtaTwZKzY80c3K9Y0IQbd0NSOYIywAzajFQvQS\npVl7bPCESOFDWCCV28iyFi5bdY/84tV/8zkKA1DjZ8xLsPibe8ePY7RJveeTo9xq\n83MHyQlRvc5eDC3EGJrlSeJjevnlTqdmr23S1XrJAoGBANQw3PInWSxeBLmPugcy\nmYFLiGG/1A7PSCHYoPzmFDxJHzRtLc0SjmDJnU0IA7us6dZvMOsMfzYgIlxkXRup\n12HABDxRYh4bXQjmTLYZE6cE4Ps9QvcfvhiIOc6cMig9e+JlQ3Npya/3DZqMgShk\nKe2KCI5kiYFLSFuAlNDy3u4t\n-----END PRIVATE KEY-----\n",
    },
  
    /* Configurations all platforms */
    test: iapTestMode, // For Apple and Google Play to force Sandbox validation only
    verbose: false, // Output debug logs to stdout stream
});

google.options(
    {
        auth: new JWT(
            "NirmalaBagERP-iap@NirmalaBagERP-51650.iam.gserviceaccount.com",
            null,
            "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxIzOnKIDpH9Gp\nDaps6ITOnpd9HHcsZQ+FUYNPDv02quCdIL1Mb5qXrhaSbxvSWACNdJtS4m7IJxav\n0lhkFH4qI6wDnwOLC5vcdmDGJ1hAqSh0jOtmvUZ05XH5MEo+ThqjIz2qdXjzSbY1\nZGZPko12LU67PONAKN+hBYTkbon84lVKgJ3iJzncEp0uoVyZ+X5/HLjpdxC/TexI\nORcm9xQAhcYMDM91VVD2SK9+t+k9hWOl56nuwHH4Y1BnQ11nszkt36KmiOKNLxoF\nhZCwP9UUsXanASCkDKdGFcOUYWaF4DCnOnQI/eveI/SSPy1yASepKyqH0BUwWI08\nAZSdQSYlAgMBAAECggEAJRDSIqTBkMaFNyQyaLag76FU3quhrkr5W/LKELV4u8M2\n2/o5UjC6PwoBFCQmxLWAbBkd1VKnTr+LKkBQGaUGH2g2es1/zs0fkJq+tkgOWf1r\nhzPjoCxz/UrztepqZq4uObvKkAwjwnjGpVZ8aCMo8bUaV+iuPsMuxEFk5O3SdvVF\nMRKGv4iZc3x1/k5yHmWS5FaqwBatb0VsocsGa3ZekbJVl08ZeA3D3Qyz6OVV8SeA\ny30a5YGnU1v8f28yNpYtjJIOPrNgS6w5NFPK+qx8LbxUJasJ0tMUqsIKZ0e/w46m\nximsJgLFLIXzysxAdJ2aezztBG2YorU1zAFbXG408QKBgQD30zessDnnOKnyCWbd\nVQuXQYLDd17ywzMJDCcWGDV/VmXrbiegc/PhefpuDGKJBfUyqOatqr8M/qdQkQ6d\nftAON1hUEEL8nvcYEhyXGxqv7InnsamjZaZBG0xHSVEoEkFw6r+uHC4mKaDHE/nv\nctIGs+tIRxcFkt1bY+xmJpDQTQKBgQC2+w5w2mzEibR86OekTLXNJQ/ChlAN+AT5\nOJ+J95DBMfiqPvnAEctlJah8pkWayYlg6vkB0TUPfud4SE8YrcmP/1s+x6zJFCHx\n1I1mOFkz8AU/022oRoNOZZPEHuSKva+ZiUQBamtDAb9wy4t0xTqgUlQfyzKy4wff\n6qxFdPhZOQKBgA0o0hQBZ5G3mI6ZoTSvh2YIvIDUnd4WL2eTlZ++uViBpffSaZhD\nj/exGnMthS3xewutnFIsduihvRCyIyyJx1J57d7I3kW7yzMkAxCjB8+/p7L95Bwh\nEarzYCGI6x5Nmdv9GyCLroeoPjlT/jmQx0ZD14KHA9nv6oEn1S23bokhAoGBAKEs\nzRCM5WfNICUyhe/L/guATLx80IEtaTwZKzY80c3K9Y0IQbd0NSOYIywAzajFQvQS\npVl7bPCESOFDWCCV28iyFi5bdY/84tV/8zkKA1DjZ8xLsPibe8ePY7RJveeTo9xq\n83MHyQlRvc5eDC3EGJrlSeJjevnlTqdmr23S1XrJAoGBANQw3PInWSxeBLmPugcy\nmYFLiGG/1A7PSCHYoPzmFDxJHzRtLc0SjmDJnU0IA7us6dZvMOsMfzYgIlxkXRup\n12HABDxRYh4bXQjmTLYZE6cE4Ps9QvcfvhiIOc6cMig9e+JlQ3Npya/3DZqMgShk\nKe2KCI5kiYFLSFuAlNDy3u4t\n-----END PRIVATE KEY-----\n",
            ['https://www.googleapis.com/auth/androidpublisher'],
        )
    }
);
  
const androidGoogleApi = google.androidpublisher({ version: 'v3' });

exports.validatePurchase = async (device, type, receipt) => {
    try {

        if (device == 'android') {

            let subscriptionReceipt = JSON.parse(receipt);

            receipt = {
                packageName: subscriptionReceipt.packageName,
                productId: subscriptionReceipt.productId,
                purchaseToken: subscriptionReceipt.purchaseToken,
                subscription: true
            };

        }

        await iap.setup();

        // iap.validate(...) automatically detects what type of receipt you are trying to validate
        const validatedData = await iap.validate(receipt);
        const purchaseData = iap.getPurchaseData(validatedData);

        console.log("purchased data ", purchaseData[0]);

        if (iap.isValidated(validatedData)) {
            console.log('valid receipt');
        }

        const isCancelled = iap.isCanceled(purchaseData[0]);
        const isExpired = iap.isExpired(purchaseData[0]);

        let receiptData = purchaseData;
        if (isExpired == false && isCancelled == false) {
            if (type == "paymentProcessing") {
                receiptData = {
                    origTxId: device === 'ios' ? purchaseData[0].transactionId : purchaseData[0].orderId,
                    startDate: device === 'ios' ? new Date(purchaseData[0].purchaseDateMs) : new Date(parseInt(purchaseData[0].startTimeMillis, 10)).toISOString(),
                    endDate: device === 'ios' ? new Date(purchaseData[0].expiresDateMs) : new Date(parseInt(purchaseData[0].expiryTimeMillis, 10)).toISOString()
                }
                // From https://developer.android.com/google/play/billing/billing_library_overview:
                // You must acknowledge all purchases within three days.
                // Failure to properly acknowledge purchases results in those purchases being refunded.
                if (device === 'android' && validatedData.acknowledgementState === 0) {
                    await androidGoogleApi.purchases.subscriptions.acknowledge({
                    packageName: receipt.packageName,
                    subscriptionId: receipt.productId,
                    token: receipt.purchaseToken
                    });
                }
            }
            console.log('Purchase validated successfully');
            return { success: true, message: 'Purchase validated successfully', data: receiptData }
        } else if (isExpired) {
            console.log('Purchase has been expired');
            return { success: false, message: "Purchase has been expired", data: receiptData }
        } else if (isCancelled) {
            console.log('Purchase has been cancelled');
            return { success: false, message: "Purchase has been cancelled", data: receiptData }
        }
        
    } catch (error) {
        console.log("Error while validating purchase", JSON.parse(error));
        return { success: false, message: 'Error while validating purchase', data: JSON.parse(error).message }
    }
}