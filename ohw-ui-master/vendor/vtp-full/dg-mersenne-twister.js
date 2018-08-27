var N = 624;

var M = 397;

var MATRIX_A = 2567483615;

var UPPER_MASK = 2147483648;

var LOWER_MASK = 2147483647;

var TINYMT32_MUL = 1 / 4294967296;

var mt = new Array(N);

var mag01 = new Array(0, MATRIX_A);

var mti = N + 1;

var initSeed;

function init(seed) {
    if (seed === undefined) {
        seed = new Date().getTime();
    }
    initSeed = seed;
    init_genrand(seed);
    return seed;
}

exports.init = init;

function getSeed() {
    return initSeed;
}

exports.getSeed = getSeed;

function init_genrand(s) {
    mt[0] = s >>> 0;
    for (mti = 1; mti < N; mti++) {
        var s = mt[mti - 1] ^ mt[mti - 1] >>> 30;
        mt[mti] = (((s & 4294901760) >>> 16) * 1812433253 << 16) + (s & 65535) * 1812433253 + mti;
        mt[mti] >>>= 0;
    }
}

function init_by_array(init_key, key_length) {
    var i,
        j,
        k;
    init_genrand(19650218);
    i = 1;
    j = 0;
    k = N > key_length ? N : key_length;
    for (;k; k--) {
        var s = mt[i - 1] ^ mt[i - 1] >>> 30;
        mt[i] = (mt[i] ^ (((s & 4294901760) >>> 16) * 1664525 << 16) + (s & 65535) * 1664525) + init_key[j] + j;
        mt[i] >>>= 0;
        i++;
        j++;
        if (i >= N) {
            mt[0] = mt[N - 1];
            i = 1;
        }
        if (j >= key_length) {
            j = 0;
        }
    }
    for (k = N - 1; k; k--) {
        var s = mt[i - 1] ^ mt[i - 1] >>> 30;
        mt[i] = (mt[i] ^ (((s & 4294901760) >>> 16) * 1566083941 << 16) + (s & 65535) * 1566083941) - i;
        mt[i] >>>= 0;
        i++;
        if (i >= N) {
            mt[0] = mt[N - 1];
            i = 1;
        }
    }
    mt[0] = 2147483648;
}

function genrand_int32() {
    if (typeof initSeed === "undefined") {
        init();
    }
    var y;
    if (mti >= N) {
        var kk;
        if (mti == N + 1) {
            init_genrand(5489);
        }
        for (kk = 0; kk < N - M; kk++) {
            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK;
            mt[kk] = mt[kk + M] ^ y >>> 1 ^ mag01[y & 1];
        }
        for (;kk < N - 1; kk++) {
            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK;
            mt[kk] = mt[kk + (M - N)] ^ y >>> 1 ^ mag01[y & 1];
        }
        y = mt[N - 1] & UPPER_MASK | mt[0] & LOWER_MASK;
        mt[N - 1] = mt[M - 1] ^ y >>> 1 ^ mag01[y & 1];
        mti = 0;
    }
    y = mt[mti++];
    y ^= y >>> 11;
    y ^= y << 7 & 2636928640;
    y ^= y << 15 & 4022730752;
    y ^= y >>> 18;
    return y >>> 0;
}

exports.genrand_int32 = genrand_int32;

function genrand_int31() {
    return genrand_int32() >>> 1;
}

exports.genrand_int31 = genrand_int31;

function genrand_real1() {
    return genrand_int32() * (1 / 4294967295);
}

exports.genrand_real1 = genrand_real1;

function random() {
    return genrand_int32() * TINYMT32_MUL;
}

exports.random = random;

function genrand_real3() {
    return (genrand_int32() + .5) * (1 / 4294967296);
}

exports.genrand_real3 = genrand_real3;

function genrand_res53() {
    var a = genrand_int32() >>> 5;
    var b = genrand_int32() >>> 6;
    return (a * 67108864 + b) * (1 / 9007199254740992);
}

exports.genrand_res53 = genrand_res53;