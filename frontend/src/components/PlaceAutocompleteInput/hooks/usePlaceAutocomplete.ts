import { ChangeEvent, useCallback, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { PlaceAutocompleteResult, usePlaceAutocompleteQuery } from "../../../graphql/generated";

interface UsePlaceAutocompleteProps {
    onSelect: (place: PlaceAutocompleteResult) => void;
}

export const usePlaceAutocomplete = ({ onSelect }: UsePlaceAutocompleteProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data, loading, error } = usePlaceAutocompleteQuery({
        variables: { input: debouncedSearchTerm },
        skip: debouncedSearchTerm.length === 0,
        onCompleted: (data) => {
            if (data.placeAutocomplete.length > 0) {
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        },
        onError: (error) => {
            console.error("Error fetching place autocomplete suggestions:", error);
            setShowSuggestions(false);
        },
    });


    const onSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const onSelectPlace = useCallback((place: PlaceAutocompleteResult) => {
        onSelect(place);
        setSearchTerm(place.placeName + ", " + place.placeAddress);
        setShowSuggestions(false);
    }, [onSelect]);

    const onBlur = useCallback(() => {
        setTimeout(() => setShowSuggestions(false), 150);
    }, []);

    const onFocus = useCallback(() => {
        if (searchTerm) {
            setShowSuggestions(true);
        }
    }, []);

    return {
        searchTerm,
        onSearch,
        onBlur,
        onFocus,
        showSuggestions,
        onSelectPlace,
        suggestions: data?.placeAutocomplete ?? [],
        autocompleteLoading: loading,
        autocompleteError: error
    };
}