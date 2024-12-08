/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocationInfo, ViewState } from '@autospace/utils/types';
import { useMap } from 'react-map-gl';
import { Autocomplete } from '../../atoms/Autocomplete';
import { useSearchLocation } from '@autospace/utils/hooks/location';
import { majorCitiesLocationInfo } from '@autospace/utils/constants';

export const SearchPlaceBox = ({
  onLocationChange,
}: {
  onLocationChange?: (location: ViewState) => void;
}) => {
  const { current: map } = useMap();
  const { loading, locationInfo, searchText, setLoading, setSearchText } =
    useSearchLocation();

  return (
    <Autocomplete<LocationInfo>
      options={locationInfo?.length ? locationInfo : majorCitiesLocationInfo}
      isOptionEqualToValue={(
        option: { placeName: string },
        value: { placeName: string },
      ) => option.placeName === value.placeName}
      noOptionsText={searchText ? 'No options.' : 'Type something...'}
      getOptionLabel={(x: { placeName: string }) => x.placeName}
      onInputChange={(_: any, v: any) => {
        setLoading(true);
        setSearchText(v);
      }}
      loading={loading}
      onChange={async (_: any, v: any) => {
        if (v) {
          const { latLng } = v;
          await map?.flyTo({
            center: { lat: latLng[0], lng: latLng[1] },
            zoom: 12,
            // essential: true,
          });
          if (onLocationChange) {
            onLocationChange({ latitude: latLng[0], longitude: latLng[1] });
          }
        }
      }}
    />
  );
};
