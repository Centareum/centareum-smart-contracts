lakshmikanths-MacBook-Pro-3:centareum-smart-contracts lakshmikanth$ truffle console

truffle(development)> EcommerceStore.deployed().then(function(contract,error){contract.addProductToStore('maggi','F&B','image','description',1000,0)});



truffle(development)> EcommerceStore.deployed().then(function(contract,error){contract.getProduct(1).then(function(prod,error){console.log(prod)})});
undefined
truffle(development)> [ BigNumber { s: 1, e: 0, c: [ 1 ] },
  'maggi',
  'F&B',
  'image',
  'description',
  BigNumber { s: 1, e: 3, c: [ 1000 ] },
  BigNumber { s: 1, e: 0, c: [ 0 ] },
  BigNumber { s: 1, e: 0, c: [ 0 ] } ]

EcommerceStore.deployed().then(function(contract,error){contract.addProductToStore('puma','Bags','image','description',1000,0)});

 EcommerceStore.deployed().then(function(contractInstance,error) {contractInstance.addProductToStore('iphone se','cellPhone','image', 'desc',200,0)});
