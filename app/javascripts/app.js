// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json'

console.log("init ecommerce store");

var EcommerceStore = contract(ecommerce_store_artifacts);


const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

console.log("init finished ipfs");


window.App = {
    start: function () {
        var self = this;

        console.log("inside load");

        EcommerceStore.setProvider(web3.currentProvider);

        console.log("web3 provider set to EcommerceStore");

        if ($("#product-details").length > 0) {
            let productId = new URLSearchParams(window.location.search).get('id');
            renderProductDetails(productId);
        } else {
            renderStore();
        }

        var reader;

        $("#product-image").change(function (event) {
            const file = event.target.files[0]
            console.log("loading image data to buffer");
            reader = new window.FileReader()
            reader.readAsArrayBuffer(file)
        });

        $("#add-item-to-store").submit(function (event) {
            console.log("#add-item-to-store");
            const req = $("#add-item-to-store").serialize();
            let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
            let decodedParams = {}
            console.log(params);
            Object.keys(params).forEach(function (v) {
                decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
            });
            console.log("saving product with decodedParams" + decodedParams);
            saveProductToBlockchain(decodedParams,reader);
            event.preventDefault();
        });

    }
};


function saveProductToBlockchain(params,reader) {

    //upload image to ipfs and get the hash
    //Add description to IPFS and get the hash
    //Pass the 2 hashes to addProductToStore function in smart-contract

    console.log(params);

    var fromAcct;



    web3.eth.getAccounts().then(function (resp, error) {
        fromAcct = resp[0];

        console.log("fromAcct: " + fromAcct);

        var imageId;
        var descId;

        saveImageOnIpfs(reader).then( function(imageHash){

            imageId = imageHash;

            saveTextBlobOnIpfs(params["product-description"]).then(function(descHash){

                descId = descHash;

        EcommerceStore.deployed().then(function (i) {

            console.log("about to add product to store" + params["product-name"] + " - " + params["product-category"] + " - " + Date.parse(params["product-start-time"]) / 1000);

            i.addProductToStore(params["product-name"], params["product-category"], imageId, descId,
                Date.parse(params["product-start-time"]) / 1000,
                web3.utils.toWei(params["product-price"], 'ether'),
                parseInt(params["product-condition"]), {from: fromAcct, gas: 4700000})
                .then(function (f) {
                    console.log(f);
                    $("#msg").show();
                    $("#msg").html("Your product was successfully added to your store!");
                })
        }) }) });
    });

}

function renderStore() {

    console.log("render store called");

    var contractInstance;

    EcommerceStore.deployed().then(function (instance1, error) {
        console.log(instance1)
    });

    EcommerceStore.deployed().then(function (instance, error) {
        contractInstance = instance;
        console.log("inside contract instance");
        instance.productIndex.call().then(function (indexResp, error) {

            console.log("got productIndex contract instance");
            console.log("rendering product for count:" + indexResp);
            for (var i = 1; i <= indexResp; i++) {
                renderProduct(contractInstance, i);
            }
        })
    });
}

function renderProduct(contractInstance, index) {

    contractInstance.getProduct.call(index).then(function (product) {
        console.log(product);
        let node = $("<div/>");
        node.addClass("col-sm-3 text-center col-margin-bottom-1 product");
        node.append("<img src='http://localhost:8080/ipfs/" + product[3] + "' />");
        node.append("<div class='title'>" + product[1] + "</div>");
        node.append("<div> price: " + displayPrice(product[6] + '') + "</div>");
        node.append("<a href='product.html?id=" + product[0] + "'>Details</div>");

        console.log("7: "+product[7]);

        if(product[7] == 0) {
            $("#product-list").append(node);
        }else{
            $("#product-purchased").append(node);
        }

    });

}


function renderProductDetails(productId) {

    EcommerceStore.deployed().then(function (resp) {

        resp.getProduct.call(productId).then(function (product) {
            console.log("price: "+product[6]);
            $("#product-name").html(product[1]);
            $("#product-image").html("<img src='http://localhost:8080/ipfs/" + product[3] + "' />");
            $("#product-price").html(displayPrice(product[6]));
            $("#product-id").val(product[0]);
            $("#buy-now-price").val(displayPrice(product[6]));
        });
    });
}

function displayPrice(amt) {
    return "&Xi;" + web3.utils.fromWei(amt, 'ether');
}


function saveImageOnIpfs(reader) {
    console.log("saving image on ipfs");
    return new Promise(function (resolve, reject) {
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
            .then((response) => {
                console.log(response)
                resolve(response[0].hash);
            }).catch((err) => {
            console.error(err)
            reject(err);
        })
    })
}

function saveTextBlobOnIpfs(blob) {
    console.log("saving textBlob on ipfs");

    return new Promise(function (resolve, reject) {
        const descBuffer = Buffer.from(blob, 'utf-8');
        ipfs.add(descBuffer)
            .then((response) => {
                console.log(response)
                resolve(response[0].hash);
            }).catch((err) => {
            console.error(err)
            reject(err);
        })
    })}

    function saveProductWithIpfs(reader, decodedParams) {
        console.log("saving product on ipfs and chain");

        let imageId, descId;
        saveImageOnIpfs(reader).then(function (id) {
            imageId = id;
            console.log("imageId: " + imageId);
            saveTextBlobOnIpfs(decodedParams["product-description"]).then(function (id) {
                descId = id;
                console.log("descId: " + descId);

                saveProductToBlockchainIpfs(decodedParams, imageId, descId);
            })
        })
    }

function buildProduct(product) {
    let node = $("<div/>");
    node.addClass("col-sm-3 text-center col-margin-bottom-1");
    node.append("<img src='http://localhost:5001/ipfs/" + product[3] + "' width='150px' />");
    node.append("<div>" + product[1] + "</div>");
    node.append("<div>" + product[2] + "</div>");
    node.append("<div>" + product[5] + "</div>");
    node.append("<div>" + product[6] + "</div>");
    node.append("<div>Ether " + product[7] + "</div>");
    return node;
}

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});