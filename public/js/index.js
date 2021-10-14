Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

Moralis.start({serverUrl,appId});

const ui = {
    connected: async function(user){
        const ethAddress = user.get('ethAddress');
        $('#login-status').html("Logined");
        $('#eth-address').html(user.get('ethAddress'));
        $('#morails-id').html(user.id);
        
        const result = await web3.eth.getBalance(user.get('ethAddress'));
        $('#balance').html(web3.utils.fromWei(result));
        const result2 = await Moralis.Web3API.account.getNativeBalance({chain:"polygo", address:ethAddress});
        console.log(web3.utils.fromWei(result2.balance));
        
    }
};

getReceiverAddress = async() => {
    try{
        const user = await Moralis.User.current();
        if(user[0] == account1Address){
            return account2Address;
        }else{
            return account1Address;
        }

    }catch(error){
        const code = error.code;
        const message = error.message;
        return account1Address;
    }
}

sendETH = async()=>{
    try{
        console.log("Send ETH")
        const receiver = getReceiverAddress(); 
        console.log("Receiver", receiver);
        // sending 0.5 ETH
        const options = {type: "native", amount: Moralis.Units.ETH("0.05"), receiver: receiver}
        let result = await Moralis.transfer(options);
        console.log(result);
    }catch(e){
        console.log(e);
    }

}

sendERC20 = async()=>{
    try{
        console.log("Send ERC 20")
        const receiver = getReceiverAddress(); 
        console.log("Receiver", receiver);
        // sending 0.5 ETH
        const options = {type: "erc20", amount: Moralis.Units.Token("0.05", "18"), receiver: receiver, contractAddress:receiver}
        let result = await Moralis.transfer(options);
        console.log(result);
    }catch(e){
        console.log(e);
    }

}

sendERC721 = async()=>{
    try{
        console.log("Send ERC721")

        const receiver = getReceiverAddress(); 
        console.log("Receiver", receiver);
        // sending 0.5 ETH
        const options = {type: "erc721",receiver: receiver,contractAddress: receiver, tokenId: 1}
        let result = await Moralis.transfer(options);
        console.log(result);
    }catch(e){
        console.log(e);
    }

}

getBlock = async() => {
    try{
        console.log("get block");
        const options = { chain: "bsc", block_number_or_hash: "2" };

        // get block content on BSC
        const transactions = await Moralis.Web3API.native.getBlock(options);
        
        console.log(transactions);
    }catch(e){
        console.log(e);
    }
}



getAccountTransaction = async() => {
    try{
        console.log("get block");
        // get mainnet transactions for the current user
        const transactions = await Moralis.Web3API.account.getTransactions();

        console.log(transactions);

        const user = Moralis.User.current();
        const address = user.get("ethAddress");

        const options = { chain: "bsc", address: account1Address, order: "desc", from_block: "0" };
        const transactions2 = await Moralis.Web3API.account.getTransactions(options);

        console.log("Transaction2", transactions2);

    }catch(e){
        console.log(e);
    }
}


Moralis.Web3.onAccountsChanged(async([account])=>{
    try{
        console.log("Change account"+account);
        $('#eth-address').html(account);
        const balance = await web3.eth.getBalance(account);
        $('#balance').html(web3.utils.fromWei(balance));
    }catch(e){
        console.log(e);
    }

})

uploadFile = async() => {

    const imgInput = document.getElementById("image-file");
    const file = imgInput.files[0];

    const moralisImg = new Moralis.File(file.name, file);
    const result = await moralisImg.save();
    console.log(result);

}

mintToken = async(_uri)=>{
    const encodedFunction  = web3.eth.abi.encodeFunctionCall({
        name:"mintToken",
        type:"function",
        inputs:[{
            type: 'string',
            name: 'tokenURI'
        }]
    }, [_uri]);

    const transactionParameters = {
        to: "0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431",
        from:ethereum.selectedAddress,
        data: encodedFunction
    }

    const txt = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    })

    return txt;
}


uploadNFT = async() => {

    const imgInput = document.getElementById("image-nft-file");
    const file = imgInput.files[0];

    const moralisImg = new Moralis.File(file.name, file);
    const result = await moralisImg.saveIPFS();
    console.log(result);

    const imageURI = moralisImg.ipfs();
    const metadata = {
        name:'Yan',
        description: "Hello Yan",
        image: imageURI
    };

    const metadataFile = new Moralis.File("metadata.json", {base64: btoa(JSON.stringify(metadata))});
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    const txt = await mintToken(metadataURI);
    console.log(txt);

}

queryTransaction = async() => {
    try{
        const user = Moralis.User.current();
        const userAddress = user.get("ethAddress");

        // create a query on the EthTransactions collection
        const collection = "EthTransactions";
        const query = new Moralis.Query(collection);
        console.log(userAddress);
        // get all the transactions sent by the current user
        query.equalTo("from_address", userAddress);

        // run the query
        const results = await query.find();
        console.log(results);

    }catch(e){
        const code = e.code;
        const message = e.message;    
    }
}

walletconnect = async(chainId)=>{
    try{

        let params = { provider: "walletconnect", chainId:chainId };

        const user = await Moralis.authenticate(params);
        ui.connected(user);
    }catch(e){
        const code = e.code;
        const message = e.message;    
    }
    
    
}

authenticate = async()=>{
    try{
        const user = await Moralis.authenticate({signingMessage:"hello"});
        ui.connected(user);
    }catch(e){
        const code = e.code;
        const message = e.message;    
    }
    
    
}

init = async () => {
    window.web3 = await Moralis.Web3.enable();
    //await Moralis.start();
    try{
        const user = await Moralis.User.current();
        ui.connected(user);
        console.log(user);
    }catch(error){
        const code = error.code;
        const message = error.message;
    }
}
login = async () => {
    try {
        const user = await Moralis.Web3.authenticate();
        ui.connected(user);
        console.log(user);
    } catch (error) {
        const code = error.code;
        const message = error.message;
    }
}

logout = async () => {
    await Moralis.User.logOut();
}

signUp = async (email, password) => {
    const user = new Moralis.User();
    user.set('username', email);
    user.set('email', email);
    user.set('password', password);
    try {
        await user.signUp();
    } catch (error) {
        const code = error.code;
        const message = error.message;
    }
};


getNFTs = async() => {
    // get NFTs for current user on Mainnet
    const userEthNFTs = await Moralis.Web3API.account.getNFTs();
    console.log(userEthNFTs);

    // get testnet NFTs for user
    const testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'ropsten' });
    console.log(testnetNFTs);

    // get polygon NFTs for address
    const options = { chain: 'matic', address: '0x...' };
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(polygonNFTs);
}


init();