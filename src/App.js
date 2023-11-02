import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { Switch, BrowserRouter, Route, Link, useParams } from 'react-router-dom';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  return <>
    <BrowserRouter>
      <ul>
        <li><Link to="/">Home</Link></li>
      </ul>

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/block/:blockNumber">
          <Block />
        </Route>
        <Route path="/tx/:txHash">
          <Transaction />
        </Route>

      </Switch>
    </BrowserRouter>
  </>;
}

export default App;

function Home() {
  const [blockNumber, setBlockNumber] = useState();

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  });

  return (
    <>
      Recent blocks:
      <ul>
        {
          Array.from({ length: 10 }, (_, index) => index).map(index => <li>
            <Link to={`/block/${blockNumber - index}`}>{blockNumber - index}</Link>
          </li>
          )
        }
      </ul>
    </>
  )
}

function Block() {
  const { blockNumber } = useParams();
  const [blockWithTransactions, setBlockWithTransactions] = useState(null);

  useEffect(() => {
    const getBlockTransactions = async () => {
      const blockWithTransactions = await alchemy.core.getBlockWithTransactions(+blockNumber);
      setBlockWithTransactions(blockWithTransactions)
    }
    getBlockTransactions()
  }, [blockNumber]);

  return <>
    <div>Block {blockNumber}</div>
    {blockWithTransactions && <div>
      <div>
        <p></p>
        <p>Transactions</p>
        <ul>
          {blockWithTransactions.transactions.map(tx => <li key={tx.hash}><Link to={`/tx/${tx.hash}`}>{tx.hash}</Link></li>)}
        </ul>
      </div>
    </div>}
  </>
}

function Transaction() {

  const { txHash } = useParams();
  const [tx, setTx] = useState(null);
  const [txReceipt, setTxReceipt] = useState(null);

  useEffect(() => {
    const getBlockTransactions = async () => {
      const [tx, txReceipt] = await Promise.all([
        alchemy.core.getTransaction(txHash),
        alchemy.core.getTransactionReceipt(txHash)
      ]);
      setTx(tx);
      setTxReceipt(txReceipt)
    }
    getBlockTransactions()
  }, [txHash]);


  return tx && txReceipt && <>
    <h2>Transaction Details</h2>
    <ul>
      <li>from: {tx.from}</li>
      <li>to: {tx.to}</li>
      <li>value: {tx.value.toString()}</li>
      <li>block: {tx.blockNumber}</li>
      <li>input: {tx.data}</li>
    </ul>

    <h2>Logs</h2>
    {txReceipt.logs.map(log => {

      return <>
        <p>Log {log.logIndex}</p>
        <ul>
          <li>address: {log.address} </li>
          <li>
            topics
            <ol>{log.topics.map(topic => <li>{topic}</li>)}</ol>
          </li>
          <li>data: {log.data}</li>
        </ul>
      </>
    })}
  </>
}
