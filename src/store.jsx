import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputChain: 'akash',
    inputVoter: 'omniflixnetwork',
    inputWeight: [3, 3, 3, 3, 3],
    
    inOutRatio: [1, 0],
    inputParticipation: [0, 1],
    inputPassed: [0, 1],
    inputMatch: [0, 1],
    inputMissblock: [0, 160],
    inputJailedRatio: [0, 1],
    inputAssetValue: [0, 17099213787107.43],
    inputDelegator: [0, 13422],
    inputRank: [1, 98],
    inputCommission: [0, 1],
    inputDay: [0, 1143],

    inputSimilar: ['chainlayer', 'stakin', 'cyphercore', '0base.vc', 'simplystaking', 'westaking'],

    selected: false
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

const inputSlice = createSlice({
    name: 'input',
    initialState,
    reducers: {
        setInputParticipation: (state, action) => {
            state.inputParticipation = action.payload;
        },
        setInputPassed: (state, action) => {
            state.inputPassed = action.payload;
        },
        setInputMatch: (state, action) => {
            state.inputMatch = action.payload;
        },
        setInputMissblock: (state, action) => {
            state.inputMissblock = action.payload;
        },
        setInputJailedRatio: (state, action) => {
            state.inputJailedRatio = action.payload;
        },
        setInputAssetValue: (state, action) => {
            state.inputAssetValue = action.payload;
        },
        setInputDelegator: (state, action) => {
            state.inputDelegator = action.payload;
        },
        setInputRank: (state, action) => {
            state.inputRank = action.payload;
        },
        setInputCommission: (state, action) => {
            state.inputCommission = action.payload;
        },
        setInputDay: (state, action) => {
            state.inputDay = action.payload;
        },
        setInOutRatio: (state, action) => {
            state.inOutRatio = action.payload;
        }
    }
});

const voterSlice = createSlice({
    name: 'voter',
    initialState,
    reducers: {
        setVoter: (state, action) => {
            state.inputVoter = action.payload;
        },
        setSimilar: (state, action) => {
            state.inputSimilar = action.payload;
        }
    }
});

const selectSlice = createSlice({
    name: 'select',
    initialState,
    reducers: {
        setSelected: (state, action) => {
            state.selected = action.payload;
        }
    }
});


export const { setChain } = chainSlice.actions;
export const { setWeight } = weightSlice.actions;
export const { setInputParticipation, setInputPassed, setInputMatch, setInputMissblock, setInputJailedRatio, setInputAssetValue, setInputDelegator, setInputRank, setInputCommission, setInputDay, setInOutRatio } = inputSlice.actions;
export const { setVoter, setSimilar } = voterSlice.actions;
export const { setSelected } = selectSlice.actions;

const store = configureStore({
    reducer: {
        chain: chainSlice.reducer,
        weight: weightSlice.reducer,
        input: inputSlice.reducer,
        voter: voterSlice.reducer,
        select: selectSlice.reducer
    }
});

export default store;
