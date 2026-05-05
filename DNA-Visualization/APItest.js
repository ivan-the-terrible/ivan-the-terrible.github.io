async function getCDSCoordinates(accession) {
  const url = `https://api.ncbi.nlm.nih.gov/datasets/v2/gene/accession/${accession}/product_report`;
  const response = await fetch(url);
  const data = await response.json();

  const transcriptData = data.reports[0]?.product?.transcripts[0];

  if (transcriptData && transcriptData.cds) {
    const { begin, end } = transcriptData.cds.range[0];
    console.log(`CDS for ${accession}: ${begin} to ${end}`);
    return {
      start: parseInt(begin),
      end: parseInt(end),
    };
  } else {
    throw new Error("CDS coordinates not found in product report.");
  }
}

async function extractCDS(accession) {
  // 1. Get Coordinates
  const coords = await getCDSCoordinates(accession);

  // 2. Get Full Sequence (using E-fetch for simplicity)
  const seqUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession}&rettype=fasta&retmode=text`;
  const seqResponse = await fetch(seqUrl);
  const fastaText = await seqResponse.text();

  // Clean the FASTA to get only the A,T,G,C string
  const fullSequence = fastaText
    .split("\n")
    .slice(1)
    .join("")
    .replace(/\s/g, "");

  // 3. Slice the string
  // Biological 38 to 466 becomes index 37 to 466
  const cdsSequence = fullSequence.slice(coords.start - 1, coords.end);

  console.log("Extracted CDS for " + accession + ":", cdsSequence);
  return cdsSequence;
}

// extractCDS("NM_000558");
extractCDS("NM_002020");

/**
 * Fetches annotations for a nucleotide accession by first
 * resolving it to a Genome Assembly ID.
 */
async function getGenomeDataFromSequence(sequenceId) {
  try {
    // STEP 1: Translate U00096.3 into a GCF/GCA Assembly ID
    const lookupUrl = `https://api.ncbi.nlm.nih.gov/datasets/v2/genome/sequence_accession/${sequenceId}/sequence_assemblies`; //result is { "accessions": [ "GCA_000005845.2" ] }
    const lookupResponse = await fetch(lookupUrl);
    const lookupData = await lookupResponse.json();

    if (!lookupData.accessions || lookupData.accessions.length === 0) {
      throw new Error(`No assembly found for accession: ${sequenceId}`);
    }

    // Usually, the first report is the most recent RefSeq assembly
    const assemblyId = lookupData.accessions[0];
    console.log(
      `Step 1 Success: ${sequenceId} belongs to Assembly ${assemblyId}`,
    );

    // STEP 2: Use that Assembly ID to get the Annotation Report
    // This contains the "map" of every gene and its products
    const annotationUrl = `https://api.ncbi.nlm.nih.gov/datasets/v2/genome/accession/${assemblyId}/annotation_report`;
    //result is: { next_page_token: "TOKEN", reports: [], total_count: 4651}
    // reports has all the genes
    const annotationResponse = await fetch(annotationUrl);

    // Note: For full genomes, this JSON can be very large
    const annotationData = await annotationResponse.json();

    console.log(
      `Step 2 Success: Found ${annotationData.total_count} features.`,
    );
    return {
      assemblyId,
      features: annotationData.reports,
      next_page_token: annotationData.next_page_token,
    };
  } catch (error) {
    console.error("API Error:", error);
  }
}

async function getSpecificGeneSequence(sequenceId, geneSymbol) {
  // 1. Get the annotations using the function above
  const { features } = await getGenomeDataFromSequence(sequenceId);

  // 2. Find the gene in the list
  const geneEntry = features[0].annotation;

  if (!geneEntry) throw new Error(`Gene ${geneSymbol} not found.`);

  // Get coordinates (E. coli genes usually have only one 'range' because no introns)
  const { begin, end } = geneEntry.genomic_regions[0].gene_range.range[0];

  // 3. Use E-Utilities to fetch ONLY that slice of the DNA sequence
  // This avoids downloading the whole 4.6MB genome string
  const start = parseInt(begin);
  const stop = parseInt(end);

  const eFetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${sequenceId}&seq_start=${start}&seq_stop=${stop}&rettype=fasta&retmode=text`;

  const seqResponse = await fetch(eFetchUrl);
  const fastaText = await seqResponse.text();

  console.log(`Sequence for ${geneSymbol}:`, fastaText);
  return fastaText;
}

// getSpecificGeneSequence("U00096.3", "thrL");
// Step 1 Success: U00096.3 belongs to Assembly GCA_000005845.2
// Step 2 Success: Found 4651 features.
// Extracted CDS for NM_000558: ATGGTGCTGTCTCCTGCCGACAAGACCAACGTCAAGGCCGCCTGGGGTAAGGTCGGCGCGCACGCTGGCGAGTATGGTGCGGAGGCCCTGGAGAGGATGTTCCTGTCCTTCCCCACCACCAAGACCTACTTCCCGCACTTCGACCTGAGCCACGGCTCTGCCCAGGTTAAGGGCCACGGCAAGAAGGTGGCCGACGCGCTGACCAACGCCGTGGCGCACGTGGACGACATGCCCAACGCGCTGTCCGCCCTGAGCGACCTGCACGCGCACAAGCTTCGGGTGGACCCGGTCAACTTCAAGCTCCTAAGCCACTGCCTGCTGGTGACCCTGGCCGCCCACCTCCCCGCCGAGTTCACCCCTGCGGTGCACGCCTCCCTGGACAAGTTCCTGGCTTCTGTGAGCACCGTGCTGACCTCCAAATACCGTTAA
// Sequence for thrL: >U00096.3:190-255 Escherichia coli str. K-12 substr. MG1655, complete genome
// ATGAAACGCATTAGCACCACCATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGA
