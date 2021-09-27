"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var crypto = __importStar(require("crypto"));
var xml_js_1 = require("xml-js");
var PKCS7Crypt = (function () {
    function PKCS7Crypt() {
        this.block_size = 32;
    }
    PKCS7Crypt.prototype.decode = function (buf) {
        var padSize = buf[buf.length - 1];
        return buf.slice(0, buf.length - padSize);
    };
    PKCS7Crypt.prototype.encode = function (buf) {
        var padSize = this.block_size - (buf.length % this.block_size);
        var fillByte = padSize;
        var padBuf = Buffer.alloc(padSize, fillByte);
        return Buffer.concat([buf, padBuf]);
    };
    return PKCS7Crypt;
}());
var PrpEncrypt = (function () {
    function PrpEncrypt(config) {
        this.ALGORITHM = 'aes-256-cbc';
        this.MSG_LENGTH_SIZE = 4;
        this.RANDOM_BYTES_SIZE = 16;
        this.appid = config.appid;
        this.key = Buffer.from(config.encodingAESKey + '=', 'base64');
        this.iv = this.key.slice(0, 16);
        this.token = config.token;
        this.customCrypt = config.customCrypt || new PKCS7Crypt();
    }
    PrpEncrypt.prototype.xml2object = function (xml) {
        return (0, xml_js_1.xml2js)(xml, { compact: true });
    };
    PrpEncrypt.prototype.object2xml = function (obj) {
        var xml = (0, xml_js_1.js2xml)(obj, { compact: true, ignoreComment: true });
        if (!xml) {
            return xml;
        }
        return '<xml>' + xml + '</xml>';
    };
    PrpEncrypt.prototype.encrypt = function (msg) {
        var _a = this, appid = _a.appid, key = _a.key, iv = _a.iv;
        var randomBytes = crypto.randomBytes(this.RANDOM_BYTES_SIZE);
        var msgLenBuf = Buffer.alloc(this.MSG_LENGTH_SIZE);
        var offset = 0;
        msgLenBuf.writeUInt32BE(Buffer.byteLength(msg), offset);
        var msgBuf = Buffer.from(msg);
        var appIdBuf = Buffer.from(appid);
        var totalBuf = Buffer.concat([randomBytes, msgLenBuf, msgBuf, appIdBuf]);
        var cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        cipher.setAutoPadding(false);
        totalBuf = this.customCrypt.encode(totalBuf);
        var encryptedBuf = Buffer.concat([cipher.update(totalBuf), cipher.final()]);
        return encryptedBuf.toString('base64');
    };
    PrpEncrypt.prototype.decrypt = function (encryptedMsg) {
        var _a = this, key = _a.key, iv = _a.iv;
        var encryptedMsgBuf = Buffer.from(encryptedMsg, 'base64');
        var decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAutoPadding(false);
        var decryptedBuf = Buffer.concat([
            decipher.update(encryptedMsgBuf),
            decipher.final(),
        ]);
        decryptedBuf = this.customCrypt.decode(decryptedBuf);
        var msgSize = decryptedBuf.readUInt32BE(this.RANDOM_BYTES_SIZE);
        var msgBufStartPos = this.RANDOM_BYTES_SIZE + this.MSG_LENGTH_SIZE;
        var msgBufEndPos = msgBufStartPos + msgSize;
        var msgBuf = decryptedBuf.slice(msgBufStartPos, msgBufEndPos);
        return msgBuf.toString();
    };
    PrpEncrypt.prototype.genSign = function (timestamp, nonce, encrypt) {
        var token = this.token;
        var rawStr = [token, timestamp, nonce, encrypt].sort().join('');
        var signature = crypto.createHash('sha1').update(rawStr).digest('hex');
        return signature;
    };
    PrpEncrypt.prototype.decryptMsg = function (msgSignature, timestamp, nonce, data) {
        var msgEncrypt = data.Encrypt;
        if (this.genSign(timestamp, nonce, msgEncrypt) !== msgSignature)
            throw new Error('msgSignature is not invalid');
        var decryptedMessage = this.decrypt(msgEncrypt);
        return this.xml2object(decryptedMessage);
    };
    ;
    PrpEncrypt.prototype.encryptMsg = function (replyMsg, opts) {
        var result = {};
        var options = opts || {};
        result.Encrypt = this.encrypt(replyMsg);
        result.Nonce = options.nonce || parseInt((Math.random() * 100000000000).toString(), 10);
        result.TimeStamp = options.timestamp || Date.now();
        result.MsgSignature = this.genSign(result.TimeStamp, result.Nonce, result.Encrypt);
        return this.object2xml(result);
    };
    ;
    return PrpEncrypt;
}());
exports["default"] = PrpEncrypt;
//# sourceMappingURL=wxMsgCrypt.js.map