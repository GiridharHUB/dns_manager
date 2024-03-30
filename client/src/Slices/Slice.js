import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hostedZoneData: [],
};

const slice = createSlice({
  name: "hostedZoneData",
  initialState,
  reducers: {
    allHostedZones: (state, data) => {
      state.hostedZoneData = data.payload;
    },
  },
});

export const { allHostedZones } = slice.actions;
export default slice.reducer;
