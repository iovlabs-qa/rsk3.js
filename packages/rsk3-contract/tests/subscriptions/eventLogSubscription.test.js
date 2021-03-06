import * as Utils from '@rsksmart/rsk3-utils';
import {formatters} from 'web3-core-helpers';
import {GetPastLogsMethod} from 'web3-core-method';
import {LogSubscription} from 'web3-core-subscriptions';
import AbstractContract from '../../src/abstractContract';
import EventLogDecoder from '../../src/decoders/eventLogDecoder';
import AbiItemModel from '../../src/models/abiItemModel';
import EventLogSubscription from '../../src/subscriptions/eventLogSubscription';

// Mocks
jest.mock('@rsksmart/rsk3-utils');
jest.mock('web3-core-helpers');
jest.mock('web3-core-method');
jest.mock('../../src/abstractContract');
jest.mock('../../src/decoders/eventLogDecoder');
jest.mock('../../src/models/abiItemModel');

/**
 * EventLogSubscription test
 */
describe('EventLogSubscriptionTest', () => {
    let eventLogSubscription, contractMock, getPastLogsMethodMock, eventLogDecoderMock, abiItemModelMock;

    beforeEach(() => {
        new AbstractContract();
        contractMock = AbstractContract.mock.instances[0];

        new GetPastLogsMethod();
        getPastLogsMethodMock = GetPastLogsMethod.mock.instances[0];

        new EventLogDecoder();
        eventLogDecoderMock = EventLogDecoder.mock.instances[0];

        new AbiItemModel();
        abiItemModelMock = AbiItemModel.mock.instances[0];

        eventLogSubscription = new EventLogSubscription(
            {},
            Utils,
            formatters,
            contractMock,
            getPastLogsMethodMock,
            eventLogDecoderMock,
            abiItemModelMock
        );
    });

    it('constructor check', () => {
        expect(eventLogSubscription.eventLogDecoder).toEqual(eventLogDecoderMock);

        expect(eventLogSubscription.abiItemModel).toEqual(abiItemModelMock);

        expect(eventLogSubscription).toBeInstanceOf(LogSubscription);
    });

    it('calls onNewSubscriptionItem returns decoded item', () => {
        eventLogDecoderMock.decode.mockReturnValueOnce(true);

        formatters.outputLogFormatter.mockReturnValueOnce({item: false});

        expect(eventLogSubscription.onNewSubscriptionItem({item: true})).toEqual(true);

        expect(eventLogDecoderMock.decode).toHaveBeenCalledWith(abiItemModelMock, {item: false});

        expect(formatters.outputLogFormatter).toHaveBeenCalledWith({item: true});
    });

    it('calls onNewSubscriptionItem returns the decoded items and triggers the changed event', (done) => {
        eventLogDecoderMock.decode.mockReturnValueOnce(true);

        formatters.outputLogFormatter.mockReturnValueOnce({item: false, removed: 1});

        eventLogSubscription.on('changed', (decodedLog) => {
            expect(decodedLog).toEqual(true);

            done();
        });

        expect(eventLogSubscription.onNewSubscriptionItem({item: true, removed: 1})).toEqual(true);

        expect(eventLogDecoderMock.decode).toHaveBeenCalledWith(abiItemModelMock, {item: false, removed: 1});

        expect(formatters.outputLogFormatter).toHaveBeenCalledWith({item: true, removed: 1});
    });
});
