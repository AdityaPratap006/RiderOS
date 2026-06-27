import { PlaceAutocompleteResult } from "../../graphql/generated";
import { usePlaceAutocomplete } from "./hooks/usePlaceAutocomplete";
import Suggestions from "./Suggestions";

interface PlaceAutocompleteInputProps {
    inputName?: string;
    onSelect: (place: PlaceAutocompleteResult) => void;
    value?: PlaceAutocompleteResult | null;
}

const PlaceAutocompleteInput = ({ inputName, onSelect, value }: PlaceAutocompleteInputProps) => {
    const {
        searchTerm,
        onSearch,
        onBlur,
        onFocus,
        showSuggestions,
        onSelectPlace,
        suggestions,
        autocompleteLoading,
        autocompleteError
    } = usePlaceAutocomplete({ onSelect, value });



    return (
        <div className="relative w-full flex flex-col gap-1">
            {inputName && (
                <span className="text-accent text-sm mb-1 block">{inputName}</span>
            )}
            <input
                type="text"
                placeholder="Enter a location"
                className="w-full p-2 rounded bg-gray-800 text-white border border-accent/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={onSearch}
                onBlur={onBlur}
                onFocus={onFocus}
            />
            <Suggestions
                suggestions={suggestions}
                onSelectPlace={onSelectPlace}
                loading={autocompleteLoading}
                showSuggestions={showSuggestions}
            />
        </div>
    )
}

export default PlaceAutocompleteInput