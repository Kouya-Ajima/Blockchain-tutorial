const SHA256 = require("crypto-js/sha256");

// ブロックの基本構造を作成
class Block {
    constructor(timestamp, data, previousHash) {
        this.timestamp = timestamp;
        this.data = data;
        // 1つ前のハッシュ
        this.previousHash = previousHash;
        // このブロックのハッシュ
        this.hash = this.calculateHash();
    }
    // ブロック内の情報のハッシュ化
    calculateHash() {
        return SHA256(
            this.previousHash + this.timestamp + JSON.stringify(this.data)
        ).toString();
    }
}

//Blockchainクラスの作成
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }
    // ジェネシスブロックの生成
    createGenesisBlock() {
        return new Block("01/01/2019", "GenesisBlock", "0");
    }
    // 1つ前のブロックを取り出す。
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    // 前のブロックのハッシュを取り出し、新たなブロックをチェーンに追加
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }
    // ブロックに改ざんが無いかどうかを検証
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // 今のブロックのハッシュが、再計算された今のハッシュと異なっていないか？
            //   → 異なっている場合、改ざんがある
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// ジェネシスブロックの作成
let originalCoin = new Blockchain();
// ブロックの追加
originalCoin.addBlock(new Block("06/02/2019", { SendCoinToA: 3 }));
originalCoin.addBlock(new Block("07/03/2019", { SendCoinToB: 8 }));

// test
console.log(JSON.stringify(originalCoin, null, 2));
console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
console.log("\n ########################### \n");

// change
originalCoin.chain[1].data = { SendCoinToA: 400 };
console.log(JSON.stringify(originalCoin, null, 2));
console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
console.log("\n ########################### \n");

// ハッシュを書き換えて改ざん
console.log(JSON.stringify(originalCoin, null, 2));
originalCoin.chain[1].hash = originalCoin.chain[1].calculateHash();
console.log("ハッシュ値を再計算した場合 → " + originalCoin.isChainValid());
