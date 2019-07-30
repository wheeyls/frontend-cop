import { validateImgs, validateAll, list } from './validate.jsx';

function img(opts = {}) {
  return Object.assign(
    {
      src: 'test.png',
      naturalWidth: 0,
      clientWidth: 0,
      className: ''
    },
    opts
  );
}

describe('validateImgs', () => {
  test('adds error class to images', () => {
    let i = img({ naturalWidth: 500, clientWidth: 249 });
    validateImgs([i]);
    expect(i.className).toEqual(
      ' frontend-cop-violation frontend-cop-violation--img-size'
    );
  });

  test('does not add error when images sized correctly', () => {
    let i = img({ naturalWidth: 500, clientWidth: 250 });
    validateImgs([i]);
    expect(i.className).toEqual('');
  });

  test('returns elements that fail', () => {
    let i = img({ naturalWidth: 500, clientWidth: 249 });

    expect(validateImgs([i])).toEqual([i]);
  });

  test('does not return successful elements', () => {
    let i = img({ naturalWidth: 500, clientWidth: 250 });

    expect(validateImgs([i])).toEqual([]);
  });

  test('does not add errors if they already exist', () => {
    let i = img({ naturalWidth: 500, clientWidth: 249 });
    validateImgs([i]);
    validateImgs([i]);
    expect(i.className).toEqual(
      ' frontend-cop-violation frontend-cop-violation--img-size'
    );
  });

  test('does not add error when naturalWidth is not available', () => {
    let i = img({ naturalWidth: undefined, clientWidth: 250 });
    validateImgs([i]);
    expect(i.className).toEqual('');
  });

  test('does not fail when clientWidth is not available', () => {
    let i = img({ naturalWidth: 1000, clientWidth: 0 });
    validateImgs([i]);
    expect(i.className).toEqual('');
  });

  test('does not add error to svg', () => {
    let i = img({ naturalWidth: 1000, clientWidth: 250, src: 'test.svg' });
    validateImgs([i]);
    expect(i.className).toEqual('');
  });

  test('removes errors if they have already been set', () => {
    let i = img({ naturalWidth: 1000, clientWidth: 250 });
    validateImgs([i]);
    i.naturalWidth = 500;
    validateImgs([i]);
    expect(i.className).toEqual('');
  });
});

describe('validateAll', () => {
  test('validates all images', () => {
    let i = img({ naturalWidth: 1000, clientWidth: 250 });
    const doc = { querySelectorAll: jest.fn().mockReturnValue([i]) };
    validateAll(doc);
    expect(i.className).toEqual(
      ' frontend-cop-violation frontend-cop-violation--img-size'
    );
  });

  test('dispatches list of failures', () => {
    let store = { dispatch: jest.fn() };
    let i = img({ naturalWidth: 1000, clientWidth: 250 });
    const doc = { querySelectorAll: jest.fn().mockReturnValue([i]) };
    validateAll(doc, store);
    expect(store.dispatch).toHaveBeenCalled()
  });
});

describe('list', () => {
  test('renders a list item per img', () => {
    expect(
      list({ badImgs: [img({ naturalWidth: 1000, clientWidth: 250 })] }).outerHTML
    ).toEqual(
      `<div class="frontend-cop"><a class="frontend-cop__close">&lt;</a><ul class="frontend-cop__list"><li><a href=\"#\">Image size of 1000 too large for container size of 250</a></li></ul></div>`
    );
  });

  test('renders an empty list', () => {
    expect(list().outerHTML).toEqual('<div class="frontend-cop"><a class="frontend-cop__close">&lt;</a><ul class="frontend-cop__list"></ul></div>');
  });

  test('clicks scroll element into view', () => {
    let i = img({ naturalWidth: 1000, clientWidth: 250, scrollIntoView: jest.fn() });
    list({ badImgs: [i] }).querySelector('li a').click()
    expect(i.scrollIntoView).toHaveBeenCalled();
  });
});
