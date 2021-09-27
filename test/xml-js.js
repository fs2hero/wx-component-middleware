// import {xml2js,js2xml} from 'xml-js';
const {xml2js,js2xml} = require('xml-js')
const XMLParser = require('xml2js');
const Promise = require('bluebird');
const parseXML = Promise.promisify(XMLParser.parseString);
const buildXML = new XMLParser.Builder({ rootName: 'xml', cdata: true, headless: true, });// renderOpts: { indent: ' ', pretty: 'true' }



function converJStoXML () {
    let result = {}
    result.Encrypt = 'contentEncrypt';
    result.Nonce = 'contentNonce'
    result.TimeStamp = 'contentTimestamp'
    result.MsgSignature = 'contentSignature'

    console.log('<xml>'+js2xml(result,{compact: true, ignoreComment: true})+'</xml>')
    console.log(buildXML.buildObject(result))
}

converJStoXML()