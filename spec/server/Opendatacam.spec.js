const { Tracker } = require('node-moving-things-tracker');
const cloneDeep = require('lodash.clonedeep');
const Opendatacam = require('../../server/Opendatacam');
const demoDetections = require('../../public/static/placeholder/alexeydetections30FPS.json');
const config = require('../../config.json');

describe('Opendatacam', () => {
  let configBackup;

  beforeAll(() => {
    configBackup = cloneDeep(config);
  });

  beforeEach(() => {
    Opendatacam.setVideoResolution({ w: 1280, h: 720 });

    config.TRACKER_SETTINGS.confidence_threshold = 0.5;
    config.TRACKER_SETTINGS.objectMaxAreaInPercentageOfFrame = 50;

    Tracker.reset();
    Tracker.setParams({
      iouLimit: 0.2,
      unMatchedFrameTolerance: 5,
      fastDelete: true,
    });
    Opendatacam.setTracker(Tracker);

    Opendatacam.isListeningToYOLO = true;
    Opendatacam.registerCountingAreas({
      'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
        color: 'yellow',
        type: 'bidirectional',
        location: {
          points: [
            { x: 0, y: 360 },
            { x: 1280, y: 360 },
          ],
          refResolution: { w: 1280, h: 720 },
        },
        name: 'test',
      },
    });
  });

  afterEach(() => {
    config.TRACKER_SETTINGS.confidence_threshold = configBackup.TRACKER_SETTINGS.confidence_threshold; // eslint-disable-line max-len
    config.TRACKER_SETTINGS.objectMaxAreaInPercentageOfFrame = configBackup.TRACKER_SETTINGS.objectMaxAreaInPercentageOfFrame; // eslint-disable-line max-len
  });

  describe('recording', () => {
    beforeEach(() => {
      Opendatacam.startRecording(false);
    });

    afterEach(() => {
      Opendatacam.stopRecording();
    });

    it('is Recording', () => {
      expect(Opendatacam.isRecording()).toBeTrue();
    });

    it('counts demo cars', () => {
      demoDetections.forEach((frame) => {
        Opendatacam.updateWithNewFrame(frame.objects, frame.frame_id);
      });

      expect(Opendatacam.getCounterSummary()).toEqual({
        'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
          _total: 41, car: 41,
        },
      });
    });
  });
});
