import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from '@rollup/plugin-replace';

export default {
    input: "logic/client.js",
    output: [
        {
            file: "dist/rtc-client.umd.js",
            format: "umd",
            name: "RtcLib"
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        json(),
        replace({
            preventAssignment: true,
            "process.env.GOOGLE_STUN_URL": "'stun:stun.l.google.com:19302'"
        })
    ]
};
