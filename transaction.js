const SHA256 = require("crypto-js/sha256");

class Transaction {
    // 送金トランザクションを格納
    constructor(senderAddress, recipientAddress, amount) {
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
    }
}

class Block {
    // ブロックの基本構造を作成
    constructor(timestamp, transactions, previousHash) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        // 1つ前のハッシュ
        this.previousHash = previousHash;
        // このブロックのハッシュ
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    // ブロック内の情報のハッシュ化
    calculateHash() {
        return SHA256(
            this.previousHash +
                this.timestamp +
                JSON.stringify(this.transactions) +
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
        // メモリープールに格納されたトランザクション郡 → マイニング未完了
        this.pendingTransactions = [];
        // マイナーへの報酬
        this.miningReward = 12.5;
    }
    // ジェネシスブロックの生成とマイニング
    createGenesisBlock() {
        let block = new Block(Date.now(), [], "0");
        block.mineBlock();
        return block;
    }
    // 1つ前のブロックを取り出す。
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // トランザクションをメモリループに追加
    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    // メモリループをマイニングして、ブロックに格納する
    //   miningRewardAddress → マイニングをした人のアドレス
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );
        // マイニング
        block.mineBlock();
        console.log("ブロックが正常にマイニングされました");
        // add block
        this.chain.push(block);
        // マイナーに報酬を与えるトランザクションを追加
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward),
        ];
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        // ブロックを１つずつ取り出す
        for (const block of this.chain) {
            // ブロックの中のトランザクションデータを１つずつ取り出す
            for (const trans of block.transactions) {
                // 送金をしたアドレスがあれば、残高から引く。
                if (trans.senderAddress === address) {
                    balance -= trans.amount;
                }
                // 残高にプラスする
                if (trans.recipientAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
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

// トランザクションの追加
originalCoin.createTransaction(new Transaction(null, "my-address", 12.5));
originalCoin.createTransaction(new Transaction("address1", "my-address", 10));
originalCoin.createTransaction(new Transaction("my-address", "address2", 2));

// マイニング完了後、ブロックの追加
console.log("\n マイニングを開始.....");
originalCoin.minePendingTransactions("my-address");

// test
console.log(
    "\n あなたのアドレスの残高は ",
    originalCoin.getBalanceOfAddress("my-address")
);

//再度マイニングを実行
console.log("\n マイニングを再度実行.....");
originalCoin.minePendingTransactions("my-address");

// test
console.log(
    "\n あなたのアドレスの残高は ",
    originalCoin.getBalanceOfAddress("my-address")
);

// test
console.log(JSON.stringify(originalCoin, null, 2));
console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
console.log("\n ########################### \n");

// // change
// originalCoin.chain[1].transactions = { SendCoinToA: 400 };
// // console.log(JSON.stringify(originalCoin, null, 2));
// console.log("改ざんなしかどうか → " + originalCoin.isChainValid());
// console.log("\n ########################### \n");

// // ハッシュを書き換えて改ざん
// originalCoin.chain[1].hash = originalCoin.chain[1].calculateHash();
// // console.log(JSON.stringify(originalCoin, null, 2));
// console.log("ハッシュ値を再計算の改ざん確認 → " + originalCoin.isChainValid());
