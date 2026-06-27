import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { PlaceAutocompleteResult, usePlaceAutocompleteQuery } from "../../../graphql/generated";

interface UsePlaceAutocompleteProps {
    onSelect: (place: PlaceAutocompleteResult) => void;
    value?: PlaceAutocompleteResult | null;
}

export const usePlaceAutocomplete = ({ onSelect, value }: UsePlaceAutocompleteProps) => {
    const initialDisplay = value ? `${value.placeName}, ${value.placeAddress}` : "";
    const [searchTerm, setSearchTerm] = useState(initialDisplay);
    const [isCommitted, setIsCommitted] = useState(!!value);

    useEffect(() => {
        if (!value) {
            setSearchTerm("");
            setIsCommitted(false);
            setShowSuggestions(false);
        }
    }, [value]);
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data, loading, error } = usePlaceAutocompleteQuery({
        variables: { input: debouncedSearchTerm },
        skip: debouncedSearchTerm.length === 0 || isCommitted,
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
        setIsCommitted(false);
        setSearchTerm(e.target.value);
    }, []);

    const onSelectPlace = useCallback((place: PlaceAutocompleteResult) => {
        setIsCommitted(true);
        setShowSuggestions(false);
        onSelect(place);
        setSearchTerm(place.placeName + ", " + place.placeAddress);
    }, [onSelect]);

    const onBlur = useCallback(() => {
        setTimeout(() => setShowSuggestions(false), 150);
    }, []);

    const onFocus = useCallback(() => {
        if (searchTerm && (data?.placeAutocomplete?.length ?? 0) > 0) {
            setShowSuggestions(true);
        }
    }, [searchTerm, data]);

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