import { combineReducers } from "redux";
import { HYDRATE } from "next-redux-wrapper";
// reducer 넣기
import test from "./test";

const rootReducer = (state, action) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload;

        default:
            return combineReducers({ test })(state, action);
    }
}

export default rootReducer;