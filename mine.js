const SHA256 = require("crypto-js/sha256");

// ブロックの基本構造を作成
class Block {
    constructor(timestamp, data, previousHash) {
        this.timestamp = timestamp;
        this.data = data;
        this.nonce = 0;
        // 1つ前のハッシュ
        this.previousHash = previousHash;
        // このブロックのハッシュ
        this.hash = this.calculateHash();
    }
    // ブロック内の情報のハッシュ化
    calculateHash() {
        return SHA256(
            this.previousHash +
                this.timestamp +
                JSON.stringify(this.data) +
                this.nonce
        ).toString();
    }

    // ナンスをインクリメントさせてマイニングする → 先頭が00 になるまでやる。
    mineBlock() {
        while (this.hash.substring(0, 2) !== "00") {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("ブロックがマイニングされました： " + this.hash);
        console.log("nonce： " + this.nonce);
    }
}

//Blockchainクラスの作成
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.chain[0].mineBlock();
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
        // newBlock.hash = newBlock.calculateHash();
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock();
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
console.log("2番目のブロックをマイニング....");
originalCoin.addBlock(new Block("06/02/2019", { SendCoinToA: 3 }));
console.log("3番目のブロックをマイニング....");
originalCoin.addBlock(new Block("07/03/2019", { SendCoinToB: 8 }));

// test
console.log(JSON.stringify(originalCoin, null, 2));
console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
console.log("\n ########################### \n");

// change
originalCoin.chain[1].data = { SendCoinToA: 400 };
// console.log(JSON.stringify(originalCoin, null, 2));
console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
console.log("\n ########################### \n");

// ハッシュを書き換えて改ざん
originalCoin.chain[1].hash = originalCoin.chain[1].calculateHash();
// console.log(JSON.stringify(originalCoin, null, 2));
console.log("ハッシュ値を再計算の改ざん確認 → " + originalCoin.isChainValid());
