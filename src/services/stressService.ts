import stressClient  from "../services/stressClient";

export const stressService = {

  start: async (username: string, email: string) => {
    const res = await stressClient.post("/start", {
      username,
      email
    });
    return res.data;
  },

  stop: async (username: string) => {
    const res = await stressClient.post("/stop", { username });
    return res.data;
  },

  status: async (username: string) => {
    const res = await stressClient.post("/status", { username });
    return res.data;
  },

  emotion: async (data: any) => {
    const res = await stressClient.post("/emotion", data);
    return res.data;
  },

  skipQuestion: async (data: any) => {
    const res = await stressClient.post("/skip-question", data);
    return res.data;
  }

};