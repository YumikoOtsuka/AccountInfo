public with sharing class AccountInfoController {

    @AuraEnabled(cacheable=true)
    public static Account_Information__c getAccountInfo(Id accountId) {
        // accountId に紐づく Account_Information__c レコードを取得 (最新のものを1件)
        // 見つからない場合は null を返す
        List<Account_Information__c> infos = [
            SELECT Id
            FROM Account_Information__c
            WHERE Account__c = :accountId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        return infos.isEmpty() ? null : infos[0];
    }

    @AuraEnabled(cacheable=true)
    public static Id getLatestImageFileId(Id recordId) {
        // recordId (Account_Information__c の ID) に関連付けられた最新の画像ファイル (ContentVersion) の ID を取得
        // 画像ファイル (jpg, jpeg, png, gif) のみを対象とする
        // 見つからない場合は null を返す

        // ContentDocumentLink を使用して関連する ContentDocument を取得
        List<ContentDocumentLink> links = [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
        ];

        if (links.isEmpty()) {
            return null;
        }

        Set<Id> documentIds = new Set<Id>();
        for (ContentDocumentLink link : links) {
            documentIds.add(link.ContentDocumentId);
        }

        // ContentDocument に関連する最新の画像 ContentVersion を取得
        List<ContentVersion> versions = [
            SELECT Id
            FROM ContentVersion
            WHERE ContentDocumentId IN :documentIds
              AND (FileType = 'JPG' OR FileType = 'JPEG' OR FileType = 'PNG' OR FileType = 'GIF')
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        return versions.isEmpty() ? null : versions[0].Id;
    }
}
