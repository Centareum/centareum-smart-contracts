pragma solidity ^0.4.23;

//Contract to publish/maintain Products in Marketplace

contract EcommerceStore {

    //enum to hold valid set for ProductStatus
    enum ProductStatus {Open, Sold, Unsold}

    //enum to hold vaild set for ProductCondition
    enum ProductCondition {New, Used}

    //Product Index - equivalent to a Sequence in Database.
    uint public productIndex;

    //Map to maintain ProductOwner and his/her Products published in store
    //Key: Address of ProductOwner , Value: ProductMap of the ProductOwner
    //(Product-Map contains all Products published by Owner in order of productIndex)
    //Product-Map: Key: productIndex , Value:Product Struct
    mapping(address => mapping(uint => Product)) stores;

    //Map to maintain owner/publisher of the product and product
    //Key: ProductIndex , Value: address of ProductOwner
    mapping(uint => address) productIdInStore;

    //Struct for Product
    struct Product {
        uint id;
        string name;
        string category;
        string imageLink;
        string descLink;
        uint startTime;
        uint price;
        ProductStatus status;
        ProductCondition condition;
    }

    //constructor
    constructor() public {
        productIndex = 0;
    }

    //add/Publish product to Store.
    function addProductToStore(string _name, string _category, string _imageLink, string _descLink, uint _startTime, uint _price, uint _productCondition) public {
        productIndex += 1;
        Product memory product = Product(productIndex, _name, _category, _imageLink, _descLink,
            _startTime, _price, ProductStatus.Open, ProductCondition(_productCondition));
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;
    }

    //extract product Data-Struct by ProductIndex
    //Function does a lookup operation on Map for stores
    function getProduct(uint _productId) view public returns (uint, string, string, string, string, uint, uint,ProductStatus, ProductCondition) {
        Product memory product = stores[productIdInStore[_productId]][_productId];
        return (product.id, product.name, product.category, product.imageLink, product.descLink, product.startTime, product.price, product.status, product.condition);
    }

}

