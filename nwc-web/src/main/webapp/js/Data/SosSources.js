Ext.ns('NWCUI.data');
NWCUI.data.SosSources = {
    dayMet: {
        observedProperty: 'MEAN_prcp',
        dataset: 'HUC12_data',
        fileName: 'HUC12_daymet.nc'
    },
    eta: {
        observedProperty: 'MEAN_et',
        dataset: 'HUC12_data',
        fileName: 'HUC12_eta_fixed.ncml'
    }
};