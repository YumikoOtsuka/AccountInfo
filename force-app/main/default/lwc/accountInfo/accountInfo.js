import { LightningElement, api, wire } from 'lwc';
import getAccountInfo from '@salesforce/apex/AccountInfoController.getAccountInfo';
import getLatestImageFileId from '@salesforce/apex/AccountInfoController.getLatestImageFileId';

export default class AccountInfo extends LightningElement {
    @api recordId; // Current Account Record Id

    accountInfoId = null;
    imageFileId = null;
    imageUrl = null;
    error = null;
    isLoading = true; // Start in loading state

    // Wire service to get the Account_Information__c record based on the Account Id
    @wire(getAccountInfo, { accountId: '$recordId' })
    wiredAccountInfo({ error, data }) {
        if (data) {
            this.accountInfoId = data.Id;
            this.error = undefined; // Clear previous error if any
            // We don't set isLoading = false here yet, wait for image fetch
        } else if (error) {
            this.error = this.reduceErrors(error).join(', ');
            this.accountInfoId = undefined;
            this.isLoading = false; // Stop loading if error fetching account info
        } else {
            // No data and no error likely means no record found
            this.accountInfoId = null; // Explicitly set to null if no record found
            this.error = undefined;
            this.isLoading = false; // Stop loading if no record found
        }
    }

    // Wire service to get the latest image file Id based on the Account_Information__c Id
    // This wire is dependent on accountInfoId, it will re-invoke when accountInfoId changes
    @wire(getLatestImageFileId, { recordId: '$accountInfoId' })
    wiredImageFileId({ error, data }) {
         this.isLoading = false; // Stop loading once this wire returns (success or error)
        if (data) {
            this.imageFileId = data;
            // Construct the image URL using the ContentVersion Id
            // Using the standard rendition download servlet
            this.imageUrl = `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${this.imageFileId}`;
            this.error = undefined;
        } else if (error) {
            this.error = this.reduceErrors(error).join(', ');
            this.imageFileId = undefined;
            this.imageUrl = undefined;
        } else {
             // No data and no error likely means no image file found
             this.imageFileId = null;
             this.imageUrl = null;
             this.error = undefined;
        }
    }

    // Helper function to reduce complex error objects to a string array
    reduceErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }

        return (
            errors
                // Remove null/undefined items
                .filter((error) => !!error)
                // Extract an error message
                .map((error) => {
                    // UI API read errors
                    if (Array.isArray(error.body)) {
                        return error.body.map((e) => e.message);
                    }
                    // Page level errors
                    else if (error.body && typeof error.body.message === 'string') {
                        return error.body.message;
                    }
                    // JS errors
                    else if (typeof error.message === 'string') {
                        return error.message;
                    }
                    // Unknown error shape so try logging
                    return error.statusText;
                })
                // Flatten
                .reduce((prev, curr) => prev.concat(curr), [])
                // Remove empty strings
                .filter((message) => !!message)
        );
    }
}
