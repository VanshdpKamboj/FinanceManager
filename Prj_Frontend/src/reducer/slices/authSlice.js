import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    signupData: null,
    loading: false,
    token: localStorage?.getItem("token") ? JSON?.parse(localStorage?.getItem("token")) : null,
    user: localStorage?.getItem("user") ? JSON?.parse(localStorage?.getItem("user")) : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setToken(state, value){
            state.token = value?.payload;
        },
        setLoading(state, value){
            state.loading = value?.payload;
        },
        setsignupData(state, value){
            state.signupData = value?.payload;
        },
        setUser(state, value){
            state.user = value?.payload;
        },
        logout(state){
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const {setToken, setLoading, setsignupData, setUser, logout} = authSlice.actions;
export default authSlice.reducer;