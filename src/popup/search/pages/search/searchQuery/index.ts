import query from './query.gql';
import {DocumentNode} from "graphql";
import {
  VideoSearch,
  VideoSearch_videoSearch_entries as SearchQueryResultEntry, VideoSearchVariables
} from './__gen_gql/VideoSearch';

function getGqlString(doc: DocumentNode) {
  return doc.loc && doc.loc.source.body;
}

export { SearchQueryResultEntry };

export const searchQuery = async (variables: VideoSearchVariables): Promise<SearchQueryResultEntry[]> => {
  if(variables.query === ""){
    return [];
  }

  const result: {data: VideoSearch} = await fetch('https://gqldev.plus-sub.com', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: getGqlString(query),
      variables
    })
  })
    .then((r) => r.json());

  return result.data.videoSearch.entries;
};
