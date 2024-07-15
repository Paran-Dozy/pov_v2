/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import style from './app.module.css';
import { LeftSideBar, MainViz, BottomComparison } from './layout';

function App() {
  
  return (
    <div className={style.app}>
      <div className={style.leftContainer}>
        <div className={style.titleContainer}>
          <div className={style.title}>Proof of Validator</div>
        </div>
        <div className={style.LeftSideBar}>
          <LeftSideBar />
        </div>
      </div>
      <div className={style.rightContainer}>
        <div className={style.MainViz}>
          <MainViz />
        </div>
        <div className={style.BottomComparison}>
          <BottomComparison />
        </div>
      </div>
    </div>
  );
}

export default App;
