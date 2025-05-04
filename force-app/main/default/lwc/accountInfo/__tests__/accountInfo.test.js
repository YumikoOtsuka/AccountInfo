import { createElement } from 'lwc';
import AccountInfo from 'c/accountInfo';
import getAccountInfo from '@salesforce/apex/AccountInfoController.getAccountInfo';
import getLatestImageFileId from '@salesforce/apex/AccountInfoController.getLatestImageFileId';

// Mock the Apex method to simulate fetching account information
const mockGetAccountInfo = jest.fn();
getAccountInfo.mockImplementation(mockGetAccountInfo);

// Mock the Apex method to simulate fetching the latest image file ID
const mockGetLatestImageFileId = jest.fn();
getLatestImageFileId.mockImplementation(mockGetLatestImageFileId);

describe('c-account-info', () => {
    afterEach(() => {
        // Clean up after each test to prevent data contamination
        jest.clearAllMocks();
    });

    it('Should fetch and display account information when a valid record is provided', async () => {
        // Arrange: Create a mock account information record
        const mockAccountInfo = {
            Id: '001xx000003NGaAAAW',
            Description__c: 'Mock account description',
        };

        // Arrange: Mock the Apex method to return the mock account information
        mockGetAccountInfo.mockResolvedValue(mockAccountInfo);

        // Act: Create the component and set the recordId
        const element = createElement('c-account-info', {
            is: AccountInfo,
        });
        element.recordId = '001xx000003NGaAAAW';
        document.body.appendChild(element);

        // Wait for the asynchronous data fetching to complete
        await Promise.resolve();

        // Assert: Check if the account information is displayed correctly
        const accountInfoDiv = element.shadowRoot.querySelector('div.account-info');
        expect(accountInfoDiv).not.toBeNull();
        expect(accountInfoDiv.textContent).toBe(mockAccountInfo.Description__c);
    });

    it('Should fetch and display an image file if available for the account information record', async () => {
        // Arrange: Create a mock account information record with an image file
        const mockAccountInfo = {
            Id: '001xx000003NGbAAA',
            Description__c: 'Mock account description with image',
        };

        // Arrange: Mock the Apex method to return the mock account information
        mockGetAccountInfo.mockResolvedValue(mockAccountInfo);

        // Arrange: Create a mock image file record
        const mockImageFileId = '068xx0000004CCGAA2';

        // Arrange: Mock the Apex method to return the mock image file ID
        mockGetLatestImageFileId.mockResolvedValue(mockImageFileId);

        // Act: Create the component and set the recordId
        const element = createElement('c-account-info', {
            is: AccountInfo,
        });
        element.recordId = '001xx000003NGbAAA';
        document.body.appendChild(element);

        // Wait for the asynchronous data fetching to complete
        await Promise.resolve();

        // Assert: Check if the image is displayed correctly
        const img = element.shadowRoot.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.src).toBe('http://localhost/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=068xx0000004CCGAA2');
    });

    it('Should handle and display errors gracefully when Apex methods return errors', async () => {
        // Arrange: Mock the Apex method to simulate an error
        mockGetAccountInfo.mockRejectedValue({
            body: {
                message: 'Error fetching account information',
            },
        });

        // Act: Create the component and set the recordId
        const element = createElement('c-account-info', {
            is: AccountInfo,
        });
        element.recordId = '001xx000003NGcAAA';
        document.body.appendChild(element);

        // Wait for the asynchronous data fetching to complete
        await Promise.resolve();

        // Assert: Check if the error message is displayed correctly
        const errorDiv = element.shadowRoot.querySelector('div.error');
        expect(errorDiv).not.toBeNull();
        expect(errorDiv.textContent).toBe('Error loading account information: Error fetching account information');
    });

    it('Should show a loading spinner while data is being fetched and processed', async () => {
        // Arrange: Mock the Apex method to simulate a delay in data fetching
        mockGetAccountInfo.mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        Id: '001xx000003NGdAAA',
                        Description__c: 'Mock account description loading',
                    });
                }, 100);
            });
        });

        // Act: Create the component and set the recordId
        const element = createElement('c-account-info', {
            is: AccountInfo,
        });
        element.recordId = '001xx000003NGdAAA';
        document.body.appendChild(element);

        // Act: Start the test and wait for the loading spinner to disappear
        const loadingSpinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(loadingSpinner).not.toBeNull();

        await Promise.resolve();

        // Assert: Check if the loading spinner is no longer visible
        const updatedLoadingSpinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(updatedLoadingSpinner).toBeNull();
    });

    it('Should not display account information or an image file when no record is found', async () => {
        // Act: Create the component and set an invalid recordId
        const element = createElement('c-account-info', {
            is: AccountInfo,
        });
        element.recordId = '001xx000003NGeAAA'; // No corresponding account information record
        document.body.appendChild(element);

        // Wait for the asynchronous data fetching to complete
        await Promise.resolve();

        // Assert: Check if the account information and image file are not displayed
        const accountInfoDiv = element.shadowRoot.querySelector('div.account-info');
        expect(accountInfoDiv).toBeNull();
        const img = element.shadowRoot.querySelector('img');
        expect(img).toBeNull();
    });

    it('Should handle multiple simultaneous data fetches from Apex methods without interference', async () => {
        // Arrange: Create mock account information records
        const mockAccountInfo1 = {
            Id: '001xx000003NGfAAA',
            Description__c: 'Mock account description 1',
        };
        const mockAccountInfo2 = {
            Id: '001xx000003NGgAAA',
            Description__c: 'Mock account description 2',
        };

        // Arrange: Mock the Apex method to simulate simultaneous data fetching
        mockGetAccountInfo
            .mockResolvedValueOnce(mockAccountInfo1)
            .mockResolvedValueOnce(mockAccountInfo2);

        // Arrange: Create a mock image file record
        const mockImageFileId = '068xx0000004CCGAA2';

        // Arrange: Mock the Apex method to return the mock image file ID
        mockGetLatestImageFileId.mockResolvedValue(mockImageFileId);

        // Act: Create the component and set the recordId for both account information records
        const element1 = createElement('c-account-info', {
            is: AccountInfo,
        });
        element1.recordId = '001xx000003NGfAAA';
        document.body.appendChild(element1);

        const element2 = createElement('c-account-info', {
            is: AccountInfo,
        });
        element2.recordId = '001xx000003NGgAAA';
        document.body.appendChild(element2);

        // Wait for the asynchronous data fetching to complete
        await Promise.resolve();

        // Assert: Check if both account information records are displayed correctly
        const accountInfoDiv1 = element1.shadowRoot.querySelector('div.account-info');
        expect(accountInfoDiv1).not.toBeNull();
        expect(accountInfoDiv1.textContent).toBe(mockAccountInfo1.Description__c);

        const accountInfoDiv2 = element2.shadowRoot.querySelector('div.account-info');
        expect(accountInfoDiv2).not.toBeNull();
        expect(accountInfoDiv2.textContent).toBe(mockAccountInfo2.Description__c);
    });
});