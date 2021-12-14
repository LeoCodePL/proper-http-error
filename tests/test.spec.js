const test = require('tape');
const Axios = require('axios').default;
const { enhanceAxios } = require('../build/index');

const a = async (axiosInstance) => {
  await axiosInstance.get('https://google.com/i-dont-exist');
}

const b = async (axiosInstance) => {
  await a(axiosInstance);
}

const getStackTrace = (err) => err.stack;

test('error enhancement', async (t) => {
  t.plan(2);

  // given
  const enhancedAxios = enhanceAxios(Axios.create());

  // when
  const enhancedErrorStack = await b(enhancedAxios).catch(getStackTrace)

  // then
  t.match(enhancedErrorStack, /at (async )?a \(/, 'found line with inner function');
  t.match(enhancedErrorStack, /at (async )?b \(/, 'found line with outer function');
});

test('Axios instance scope', async (t) => {
  t.plan(4);

  // given
  const plainAxios = Axios.create();
  const enhancedAxios = enhanceAxios(Axios.create());

  // when
  const enhancedErrorStack = await b(enhancedAxios).catch(getStackTrace)

  const plainAxiosErrorStack = await b(plainAxios).catch(getStackTrace)

  // then
  t.match(enhancedErrorStack, /at (async )?a \(/, 'found line with inner function');
  t.match(enhancedErrorStack, /at (async )?b \(/, 'found line with outer function');

  t.doesNotMatch(plainAxiosErrorStack, /at (async )?a \(/, 'not found line with inner function');
  t.doesNotMatch(plainAxiosErrorStack, /at (async )?b \(/, 'not found line with outer function');
});
