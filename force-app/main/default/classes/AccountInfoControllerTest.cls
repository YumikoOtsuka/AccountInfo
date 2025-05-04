@isTest
private class AccountInfoControllerTest {


@IsTest
    static void testGetLatestImageFileId() {
        // テストデータ作成
        Account_Information__c accountInfo = new Account_Information__c();
        insert accountInfo;

        // テストデータ作成
        ContentVersion cv = new ContentVersion(
            Title = 'Test Image',
            PathOnClient = 'TestImage.jpg',
            VersionData = Blob.valueOf('Test Image Content'),
            FileType = 'JPG'
        );
        insert cv;

        ContentVersion insertedCv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];

        // test data creation
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId = insertedCv.ContentDocumentId,
            LinkedEntityId = accountInfo.Id
        );

        insert cdl;

        Test.startTest();

        // メソッドの呼び出し
        Id result = AccountInfoController.getLatestImageFileId(accountInfo.Id);

        Test.stopTest();

        // 検証
        System.assertEquals(cv.Id, result, '画像ファイルの ID が正しく取得できているか確認');
    }


@IsTest
    static void testGetAccountInfo() {
        // テストデータ作成
        Account account = new Account(Name = 'Test Account');
        insert account;

        Account_Information__c accountInfo = new Account_Information__c(Account__c = account.Id);
        insert accountInfo;

        Test.startTest();

        // メソッドの呼び出し
        Account_Information__c result = AccountInfoController.getAccountInfo(account.Id);

        Test.stopTest();

        // 検証
        System.assertEquals(accountInfo.Id, result.Id, '取得した Account Information レコードのIDが正しく取得できているか確認');
    }
}