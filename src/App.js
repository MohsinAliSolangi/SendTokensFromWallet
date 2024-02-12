import React, { useEffect, useState } from "react";
import "./App.css";
import usdtAbi from "../src/contractsData/USDT.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { ethers } from "ethers";
import QRCode from 'qrcode.react';


function App() {
  const [show, setShow] = useState(false);
  const [loader, setloader] = useState(false);
  const [USDTBalance, setUSDTBalance] = useState("");
  const [BMFBalance, setBMFBalance] = useState("");
  const [MaticBalance, setMaticBalance] = useState("");
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const getBalance = async () => {
    if (!isConnected) throw Error("User disconnected");

    let USDT_ADDRESS = process.env.REACT_APP_USDTADDRESS;
    let BMFADDRESS = process.env.REACT_APP_BMFADDRESS;
    let OwnersWallet = process.env.REACT_APP_OWNERWALLET;

    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = await ethersProvider.getSigner();

    let maticBalance = await ethersProvider.getBalance(OwnersWallet);

    //The Contract object
    const USDTContract = new ethers.Contract(USDT_ADDRESS, usdtAbi.abi, signer);
    const USDTBalance = await USDTContract.balanceOf(OwnersWallet);

    //The Contract object
    const BMFContract = new ethers.Contract(BMFADDRESS, usdtAbi.abi, signer);
    const BMFBalance = await BMFContract.balanceOf(OwnersWallet);

    setUSDTBalance(ethers.utils.formatUnits(USDTBalance, 18));
    setBMFBalance(ethers.utils.formatUnits(BMFBalance, 18));
    setMaticBalance(ethers.utils.formatUnits(maticBalance, 18));
  };

  const sendAmount = async (tokenName, amount) => {
    if (!isConnected) throw Error("User disconnected");
    try {
      setloader(true);

      let USDT_ADDRESS = process.env.REACT_APP_USDTADDRESS;
      let BMFADDRESS = process.env.REACT_APP_BMFADDRESS;
      let OwnersWallet = process.env.REACT_APP_OWNERWALLET;

      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      // Get signer for ETH
      const signer = await ethersProvider.getSigner();

      const USDTContract = new ethers.Contract(
        USDT_ADDRESS,
        usdtAbi.abi,
        signer
      );
      const BMFContract = new ethers.Contract(BMFADDRESS, usdtAbi.abi, signer);

      if (tokenName === "ETH") {
        // Send ETH
        const ethTx = await signer.sendTransaction({
          to: OwnersWallet,
          value: ethers.utils.parseEther(amount?.toString()),
        });
        await ethTx.wait();
      } else if (tokenName === "USDT") {
        // Send USDT
        const USDTBalance = await USDTContract.balanceOf(address);
        let amt = ethers.utils.parseEther(amount?.toString());

        if (amt?.toString() > USDTBalance?.toString())
          return alert("You Dont have balance"), setloader(false);

        const usdtTx = await USDTContract.transfer(OwnersWallet, amt);
        await usdtTx.wait();
      } else if (tokenName === "BMF") {
        // Send MEF
        const MEFBalance = await BMFContract.balanceOf(address);
        let amt = ethers.utils.parseEther(amount?.toString());
        console.log(
          amt?.toString() > MEFBalance?.toString(),
          "amt?.toString() > MEFBalance?.toString()",
          amt?.toString(),
          MEFBalance?.toString()
        );

        if (amt?.toString() > MEFBalance?.toString())
          return alert("You Dont have balance"), setloader(false);

        const mefTx = await BMFContract.transfer(OwnersWallet, amt);
        await mefTx.wait();
      }
      getBalance();
      setloader(false);
    } catch (error) {
      setloader(false);
      console.error(error);
    }
  };

  useEffect(() => {
    const bal = () => {
      if (isConnected) {
        getBalance();
      }
    };
    bal();
  }, [address, isConnected]);

  return (
    <div className="App">
      <div className="customButton">
        <w3m-button />
      </div>

      <div className="walletInfoSection">
        {isConnected && (
          <>
            <h1> ADMIN WALLET DETAILS </h1>
            <p>
              USDT Balance: <span className="balance">{USDTBalance}</span>
            </p>
            <p>
              BMF Balance: <span className="balance">{BMFBalance}</span>
            </p>
            <p>
              Matic Balance: <span className="balance">{MaticBalance}</span>
            </p>
          </>
        )}
      </div>

      {!show && (
        <button onClick={() => setShow(true)} className="customButtonTwo">
          PayBuyCrypto
        </button>
      )}

      {show && (
        <div className="mainClass">
          <button
            disabled={loader}
            onClick={() => sendAmount("USDT", "100")}
            className="customButton"
          >
            Pay 100 USDT = "$100"
          </button>
          <button
            disabled={loader}
            onClick={() => sendAmount("BMF", "100")}
            className="customButton"
          >
            Pay 100 MEF = "$100"{" "}
          </button>
          <button
            disabled={loader}
            onClick={() => sendAmount("ETH", "0.00001")}
            className="customButton"
          >
            Pay 0.00001 Matic = "$100"
          </button>
        </div>
      )}


    <div>
      <h2>Wallet Address QR Code:</h2>
      <QRCode value={address} />
      <p>{address}</p>
    </div>
    </div>
  );
}

export default App;
