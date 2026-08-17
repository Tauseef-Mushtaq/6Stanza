/**
 * Vector silhouette of the 6STANZA geometric mark, extracted from the
 * official public/6stanza-mark.png via alpha-channel contour tracing
 * (OpenCV findContours + approxPolyDP), normalized to a -1..1 unit box.
 * This is the data BrandGeometry.tsx uses to build the 3D hero object's
 * ExtrudeGeometry -- the silhouette is not hand-approximated.
 * Do not hand-edit; regenerate from the source PNG if the logo changes.
 */
export interface MarkSubShape {
  outer: [number, number][];
  holes: [number, number][][];
}

export const MARK_SHAPES: MarkSubShape[] = [{"outer": [[0.608, -0.504], [0.324, -0.228], [0.192, -0.356], [0.34, -0.508], [0.0, -0.848], [-0.02, -0.84], [-0.024, -0.848], [-0.152, -0.848], [-0.236, -0.94], [0.156, -0.944], [0.184, -0.936]], "holes": []}, {"outer": [[0.208, 0.936], [-0.148, 0.924], [-0.592, 0.46], [-0.584, 0.116], [-0.004, -0.456], [0.368, -0.092], [0.252, 0.048], [0.32, 0.044], [0.424, -0.032], [0.512, 0.048], [0.068, 0.488], [0.02, 0.484], [-0.268, 0.184], [-0.144, 0.06], [0.044, 0.24], [0.236, 0.052], [-0.004, -0.18], [-0.488, 0.312], [0.004, 0.816], [0.12, 0.824]], "holes": []}];
