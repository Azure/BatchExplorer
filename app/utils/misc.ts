
/**
 * Used to convert an interface to a make all attributes optional
 *
 * @example
 * // Given this
 * interface Person {
 *   name: string;
 *   age: number;
 *   location: string;
 * }
 *
 * // The next 2 are equivalent
 * interface PartialPerson {
 *   name?: string;
 *   age?: number;
 *   location?: string;
 * }
 *
 * type PartialPerson = Partial<Person>;
 */
export type Partial<T> = {
    [P in keyof T]?: T[P];
};
