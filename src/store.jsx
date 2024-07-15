import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputChain: 'akash',
    inputWeight: [3, 3, 3, 3, 3],
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
export const { toggleCircleId, resetCircleIds } = circleSlice.actions;
export const { addInterested, removeInterested } = interestedSlice.actions;

const store = configureStore({
    reducer: {
        chain: chainSlice.reducer,
        weight: weightSlice.reducer,
        circles: circleSlice.reducer,
        interested: interestedSlice.reducer
    }
});

export default store;
