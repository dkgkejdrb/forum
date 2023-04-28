// Action Types
const TEST = "TEST";

// Action Creators
export const testAction = (text) => ({ type: TEST, text });

// Initial State
const initialState = "";

// Reducer
const test = (state = initialState, action) => {
    switch (action.type) {
        case TEST:
            return action.text;
            // 상태값 저장 return [...state, action.text];
        default:
            return state;
    }
};

export default test;