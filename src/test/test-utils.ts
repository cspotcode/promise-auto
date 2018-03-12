import mocha from 'mocha';
export {describe, it, before, beforeEach, after, afterEach, xit, xdescribe} from 'mocha';
import sinon from 'sinon';
import chai from 'chai';
export {expect, assert} from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

export {sinon};