import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputChain: 'akash',
    inputWeight: [3, 3, 3, 3, 3],
    conditionScore: 70,
    conditionMissblock: 10,
    conditionJailed: 0.01,
    conditionTokenOutlier: 3,
    conditionParticipation: 0.5,
    onlyIn: true,
    inOutPercentage: [0.8, 0.2],
    inputVoter: '0base.vc',
    selectedCircleIds: [],
    selectedChainVals: []
};

const chainSlice = createSlice({
    name: 'chain',
    initialState,
    reducers: {
        setChain: (state, action) => {
            state.inputChain = action.payload;
        }
    }
});

const weightSlice = createSlice({
    name: 'weight',
    initialState,
    reducers: {
        setWeight: (state, action) => {
            state.inputWeight = action.payload;
        }
    }
});

const conditionSlice = createSlice({
    name: 'condition',
    initialState,
    reducers: {
        setConditionScore: (state, action) => {
            state.conditionScore = action.payload;
        },
        setConditionMissblock: (state, action) => {
            state.conditionMissblock = action.payload;
        },
        setConditionJailed: (state, action) => {
            state.conditionJailed = action.payload;
        },
        setConditionTokenOutlier: (state, action) => {
            state.conditionTokenOutlier = action.payload;
        },
        setConditionParticipation: (state, action) => {
            state.conditionParticipation = action.payload;   
        }
    }

});







const voterSlice = createSlice({
    name: 'voter',
    initialState,
    reducers: {
        setVoter: (state, action) => {
            state.inputVoter = action.payload;
        }
    }
});

const circleSlice = createSlice({
    name: 'circles',
    initialState,
    reducers: {
        toggleCircleId: (state, action) => {
            const index = state.selectedCircleIds.indexOf(action.payload);
            if (index > -1) {
                state.selectedCircleIds.splice(index, 1);
            } else {
                state.selectedCircleIds.push(action.payload);
            }
        },
        resetCircleIds: (state) => {
            state.selectedCircleIds = [];
        }
    }
});

const interestedSlice = createSlice({
    name: 'interested',
    initialState,
    reducers: {
        addInterested: (state, action) => {
            const exists = state.selectedChainVals.some(
                item => item[0] === action.payload[0] && item[1] === action.payload[1]
            );
            if(exists){
                console.log("Already exists");
            } else{
                state.selectedChainVals.push(action.payload);
            }
        },
        removeInterested: (state, action) => {
            state.selectedChainVals.splice(action.payload, 1);
        }
    }
});

export const { setChain } = chainSlice.actions;
export const { setWeight } = weightSlice.actions;
export const { setConditionScore, setConditionMissblock, setConditionJailed, setConditionTokenOutlier, setConditionParticipation } = conditionSlice.actions;

export const { setVoter } = voterSlice.actions;
export const { toggleCircleId, resetCircleIds } = circleSlice.actions;
export const { addInterested, removeInterested } = interestedSlice.actions;

const store = configureStore({
    reducer: {
        chain: chainSlice.reducer,
        weight: weightSlice.reducer,
        condition: conditionSlice.reducer,
        voter: voterSlice.reducer,
        circles: circleSlice.reducer,
        interested: interestedSlice.reducer
    }
});

export default store;
