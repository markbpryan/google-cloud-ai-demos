/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Alert, AlertTitle, CircularProgress, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DebouncedTextField from 'demos/matching-engine/components/DebouncedTextField';
import { MatchResults } from 'demos/matching-engine/components/MatchResults';
import { SelectionList } from 'demos/matching-engine/components/SelectionList';
import { getItems, ItemInfo, ItemInfosResponse, MatchServiceInfo } from 'demos/matching-engine/queries';
import * as React from 'react';
import { useQuery } from 'react-query';

interface MatchFlowProps {
  matchServiceId: string;
  allowsTextInput: boolean;
  items: ItemInfo[];
}

const MatchSelectionAndResults = ({ matchServiceId, allowsTextInput: textInputAllowed, items }: MatchFlowProps) => {
  const [textFieldText, setTextFieldText] = React.useState<string>('');
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Container maxWidth="xl">
      <Grid container spacing={7}>
        <Grid xs={12} md={8}>
          <Typography variant="h3">Search for an item</Typography>
          {textInputAllowed ? (
            <DebouncedTextField
              text={textFieldText}
              setText={setTextFieldText}
              textChanged={(text: string) => {
                setSearchQuery(text);
              }}
            />
          ) : null}
          <Stack spacing={0} marginTop={2}>
            <Typography variant="overline">Suggestions</Typography>
            <SelectionList
              items={items}
              selectedIndex={selectedIndex}
              onSelected={(item: ItemInfo, index: number) => {
                if (item.text != null) {
                  if (textInputAllowed) {
                    setTextFieldText(item.text);
                  } else {
                    setSearchQuery(item.text);
                  }
                }

                setSearchQuery('');
                setSelectedIndex(undefined);
                setSelectedIndex(index);
              }}
            />
          </Stack>
        </Grid>
        <Grid xs={12} md={4}>
          {searchQuery.length > 0 ? (
            <>
              <Typography variant="h6">Search results</Typography>
              <br />
              <MatchResults matchServiceId={matchServiceId} searchQuery={searchQuery} />
            </>
          ) : null}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ({ matchServiceInfo }: { matchServiceInfo: MatchServiceInfo }) => {
  const {
    isLoading,
    error,
    data: itemsResponse,
    isError,
  } = useQuery<ItemInfosResponse, Error>(
    ['getItems', matchServiceInfo.id],
    () => {
      return getItems(matchServiceInfo.id);
    },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <Alert icon={<CircularProgress size={3} />} severity="info">
        Loading...
      </Alert>
    );
  } else if (itemsResponse != null && itemsResponse.items != null) {
    return (
      <MatchSelectionAndResults
        matchServiceId={matchServiceInfo.id}
        allowsTextInput={matchServiceInfo.allowsTextInput}
        items={itemsResponse.items}
      />
    );
  } else if (isError && error) {
    return (
      <Alert icon={<CircularProgress size={3} />} severity="error">
        <AlertTitle>Could not load images</AlertTitle>
        {error.message}
      </Alert>
    );
  } else {
    return null;
  }
};
