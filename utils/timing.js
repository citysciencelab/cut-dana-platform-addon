/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 */

// eslint-disable-next-line valid-jsdoc
/**
 * This function can time how long a function takes.
 * @param {requestCallback} cb - The callback needs to be timed
 * @returns {Promise<void>}
 */
export async function timer (cb) {
    const startTime = performance.now();

    await cb();

    console.log(`Execution time: ${performance.now() - startTime} ms`);
}
