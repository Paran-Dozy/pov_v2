/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { SelectChain, Weight, Filter, InterestedVal, Ranking, Center, ClassificationInfo, BottomLineChart, RadarChartComponent } from './components/index';
import ChainData from './data/chain.json';
import ValData from './data/fin_data.json';
import allData from './data/fin_data.json';

import { useDispatch, useSelector } from 'react-redux';

function App() {
  const [selectedChain, setSelectedChain] = useState('akash');
  const [activeNum, setActiveNum] = useState(100);
  const [weightList, setWeightList] = useState([3, 3, 3, 3]);
  const [sortedList, setSortedList] = useState();
  const [filterRatio, setFilterRatio] = useState(100);
  const [response, setResponse] = useState('');
  const [classInfo, setClassInfo] = useState('');
  const [nodeNum, setNodeNum] = useState(100);
  const [selectedData, setSelectedData] = useState(allData.filter(item => item.chain_id === 'akash'));
  const [recommendData, setrecommendData] = useState('')
  const selectedChainVals = useSelector((state) => state.interested.selectedChainVals);

  const chainSelect = chain => {
    setSelectedChain(chain);
    setActiveNum(
      ChainData.find(item => item.chain_id === chain).active_val_num,
    );
    setSelectedData(allData.filter(item => item.chain_id === chain));
  };

  const changeWeight = weights => {
    setWeightList(weights);
  };

  const changeFilter = ratio => {
    setFilterRatio(ratio);
  };

  useEffect(() => {
    const updateScore = chain => {
      const valRank = [];
      ValData.forEach(val => {
        if (chain === val.chain_id && val.rank <= activeNum) {
          const ratioTotal =
            +weightList[0] + +weightList[1] + +weightList[2] + +weightList[3];
          const contribution = +val.contribution_score * +weightList[0];
          const stability = +val.stability_score * +weightList[1];
          const popularity = +val.popularity_score * +weightList[2];
          const commission = +val.commission_score * +weightList[3];

          const total =
            (contribution + stability + popularity + commission) / ratioTotal;
          valRank.push({
            val_id: val.val_id,
            contribution: contribution / ratioTotal,
            stability: stability / ratioTotal,
            popularity: popularity / ratioTotal,
            commission: commission / ratioTotal,
            total_score: total,
          });
        }
      });

      valRank.sort((a, b) => b.total_score - a.total_score);
      setNodeNum(Math.ceil(valRank.length * (+filterRatio / 100.0)));
      setSortedList(valRank.slice(0, nodeNum));
    };

    const sendData = async () => {
      const dataToSend = { chain_id: selectedChain, weightList: weightList };
      const interested = []
      selectedChainVals.forEach((cv) => {
        const interDict = {"chain_id": cv[0], "val_id": cv[1]}
        interested.push(interDict);
      })
      const interData = {"selected": dataToSend, "interested": interested}
    
      try {
        const response = await fetch('http://localhost:5002/pca', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const responseData = await response.json();
        setResponse(JSON.parse(responseData).slice(0, nodeNum));
      } catch (error) {
          console.error('There was an error!', error);
      }
  
      try {
        const response = await fetch('http://localhost:5002/classInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const responseData = await response.json();
        setClassInfo(JSON.parse(responseData));
      } catch (error) {
          console.error('There was an error!', error);
      }

      if(interested.length > 0){
        try {
          const response = await fetch('http://localhost:5002/recommend', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(interData)
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const responseData = await response.json();
          setrecommendData(responseData);
        } catch (error) {
            console.error('There was an error!', error);
        }
      } 
    };
    updateScore(selectedChain);
    sendData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain, activeNum, weightList, filterRatio, selectedChainVals]);

  return (
    <div className="App">
      <header className="title-line">
        <div className="title">
          <p className="pov">Proof of Validator</p>
        </div>
      </header>
      <div className="main">
        <div className="leftDiv">
          <div className="userInput">
            <SelectChain chainSelect={chainSelect} ChainData={ChainData}/>
            <Weight changeWeight={changeWeight}/>
            <Filter changeFilter={changeFilter}/>
          </div>
          <div className="interVal">
            <InterestedVal ChainData={ChainData} ValData={ValData}/>
          </div>
          <div className="ranking">
            {sortedList ? (
              <Ranking valList={sortedList} />
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>
        <div className="rightDiv">
          <div className="rightTop">
            <div className="center">
              <Center cooldinateData={response} data={selectedData} weightList={weightList} recommendData={recommendData}/>
            </div>
            <div className="rightSideBar">
              <ClassificationInfo data={classInfo} className="classInfo" />
              <RadarChartComponent className="valScore" valList={sortedList}/>
            </div>
          </div>
          <div className="history">
            <BottomLineChart selectedChain={selectedChain} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
