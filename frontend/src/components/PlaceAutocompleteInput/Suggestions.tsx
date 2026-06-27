import { PlaceAutocompleteResult } from "../../graphql/generated";

interface SuggestionsProps {
    showSuggestions: boolean
    suggestions: PlaceAutocompleteResult[];
    onSelectPlace: (place: PlaceAutocompleteResult) => void;
    loading: boolean;
}

const Suggestions = ({ suggestions, onSelectPlace, loading, showSuggestions }: SuggestionsProps) => {

    if (!showSuggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="absolute top-full mt-1 z-10 w-full bg-gray-800 border border-accent/60 rounded max-h-60 overflow-y-auto">
            {loading && <>...searching</>}
            {suggestions.map(suggestion => (
                <div
                    key={suggestion.eLoc}
                    className="p-2 cursor-pointer hover:bg-gray-700"
                    onClick={() => onSelectPlace(suggestion)}
                >
                    <div className="font-semibold">{suggestion.placeName}</div>
                    <div className="text-sm text-gray-400">{suggestion.placeAddress}</div>
                </div>
            ))}
        </div>
    );
}

export default Suggestions