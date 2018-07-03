Eutil = require('ethereumjs-util');
EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function(callback) {
 current_time = Math.round(new Date() / 1000);
 amt_1 = web3.toWei(1, 'ether');
 EcommerceStore.deployed().then(function(contractInstance,error) {contractInstance.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'QmXd9sgchuRFJvRdQJpjgg73R8JzSPtffKMJP8qj5iTAzA','desc',current_time,20000,0)});
  EcommerceStore.deployed().then(function(i,error) {i.productIndex.call().then(function(f){console.log(f)})});
}